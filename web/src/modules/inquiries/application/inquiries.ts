import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import { getPublishedContent } from '@/modules/content'
import type { Inquiry } from '@/lib/inquiry'
import { csvCell } from '@/lib/csv'
import { notificationRecipients } from '../infrastructure/mailer'
import { processOutbox } from './outbox'

export const INQUIRY_STATUSES = ['NEW', 'CONTACTED', 'CLOSED'] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

const TYPE_LABEL: Record<string, string> = {
  CONSULTATION: 'Consultation request',
  VALUATION: 'Valuation request',
  PROPERTY_INQUIRY: 'Viewing request',
  PROJECT_BRIEFING: 'Project briefing request',
}

/** No line breaks in header values (subject), whatever the visitor typed. */
const oneLine = (value: string, max = 120) =>
  value
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max)

export function notificationEmail(inquiry: Omit<Inquiry, 'website'> & { id: string }) {
  const subject = oneLine(`${TYPE_LABEL[inquiry.type] ?? 'Website request'}: ${inquiry.name}`)
  const text = [
    `${TYPE_LABEL[inquiry.type] ?? inquiry.type} from the website`,
    '',
    `Name: ${oneLine(inquiry.name)}`,
    `Phone: ${oneLine(inquiry.phone)}`,
    `Email: ${oneLine(inquiry.email)}`,
    `Interest: ${oneLine(inquiry.interest, 200)}`,
    ...(inquiry.context ? [`About: ${oneLine(inquiry.context, 200)}`] : []),
    ...(inquiry.pagePath ? [`Page: ${oneLine(inquiry.pagePath, 300)}`] : []),
    '',
    'Notes:',
    inquiry.notes || '—',
    '',
    `Reference: ${inquiry.id}`,
  ].join('\n')
  return { subject, text }
}

/**
 * Saves the request and queues its notification email in ONE transaction: if the email row
 * cannot be written, the request is not half-saved, and once saved, nothing is lost even if
 * sending fails or SMTP is not configured yet (AGENTS.md: persist before notifying).
 */
export async function submitInquiry(
  data: Omit<Inquiry, 'website'>,
  meta: { ipHash: string | null; userAgent: string | null },
): Promise<{ id: string }> {
  await ensureReady()
  const settings = await getPublishedContent('settings')
  const to = notificationRecipients() ?? settings.company.email
  const inquiry = await prisma.$transaction(async (tx) => {
    const created = await tx.inquiry.create({
      data: {
        ...data,
        context: data.context || null,
        pagePath: data.pagePath || null,
        ipHash: meta.ipHash,
        userAgent: meta.userAgent?.slice(0, 300) ?? null,
      },
      select: { id: true },
    })
    const email = notificationEmail({ ...data, id: created.id })
    await tx.emailOutbox.create({
      data: { to, ...email, relatedType: 'Inquiry', relatedId: created.id },
    })
    return created
  })
  // Fire and forget: the visitor's answer does not wait for SMTP.
  processOutbox().catch((error) => console.error('[outbox] send after inquiry failed', error))
  return inquiry
}

export async function listInquiries(
  actor: Actor,
  {
    status,
    type,
    page = 1,
    pageSize = 50,
  }: { status?: string; type?: string; page?: number; pageSize?: number },
) {
  authorize(actor, 'inquiry.view')
  await ensureReady()
  const where = { ...(status ? { status } : {}), ...(type ? { type } : {}) }
  const [rows, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inquiry.count({ where }),
  ])
  return { rows, total, page, pageSize }
}

export async function setInquiryStatus(actor: Actor, id: string, status: string) {
  authorize(actor, 'inquiry.update')
  if (!(INQUIRY_STATUSES as readonly string[]).includes(status)) {
    return { ok: false as const, error: 'Unknown status.' }
  }
  await prisma.$transaction(async (tx) => {
    await tx.inquiry.update({ where: { id }, data: { status } })
    await recordAudit(
      {
        actor,
        action: 'inquiry.status_changed',
        targetType: 'Inquiry',
        targetId: id,
        metadata: { status },
      },
      tx,
    )
  })
  return { ok: true as const }
}

const CSV_COLUMNS = [
  'createdAt',
  'type',
  'status',
  'name',
  'phone',
  'email',
  'interest',
  'context',
  'notes',
  'pagePath',
] as const

export async function exportInquiries(actor: Actor, format: 'json' | 'csv') {
  authorize(actor, 'inquiry.export')
  await ensureReady()
  const rows = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5000 })
  await recordAudit({
    actor,
    action: 'inquiry.exported',
    targetType: 'Inquiry',
    metadata: { format, count: rows.length },
  })
  if (format === 'json') return { rows }
  const lines = [
    CSV_COLUMNS.join(','),
    ...rows.map((row) => CSV_COLUMNS.map((c) => csvCell(row[c])).join(',')),
  ]
  // BOM so Excel opens UTF-8 (Arabic names) correctly.
  return { csv: `\uFEFF${lines.join('\r\n')}\r\n` }
}
