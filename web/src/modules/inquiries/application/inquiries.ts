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
  LIST_PROPERTY: 'List with us request',
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
    ...(inquiry.email ? [`Email: ${oneLine(inquiry.email)}`] : []),
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
  meta: { ipHash: string | null; userAgent: string | null; customerId?: string | null },
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
    // Signed-in visitor: the request also appears on their account page (D-40).
    if (meta.customerId) {
      await tx.customerInquiry.create({
        data: { inquiryId: created.id, customerId: meta.customerId },
      })
    }
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
  const safePage = Math.min(10_000, Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1))
  const safeSize = Math.min(200, Math.max(1, Number.isFinite(pageSize) ? Math.floor(pageSize) : 50))
  const where = { ...(status ? { status } : {}), ...(type ? { type } : {}) }
  const [rows, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeSize,
      take: safeSize,
    }),
    prisma.inquiry.count({ where }),
  ])
  return { rows, total, page: safePage, pageSize: safeSize }
}

export async function setInquiryStatus(actor: Actor, id: string, status: string) {
  authorize(actor, 'inquiry.update')
  if (!(INQUIRY_STATUSES as readonly string[]).includes(status)) {
    return { ok: false as const, error: 'Unknown status.' }
  }
  await ensureReady()
  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.inquiry.updateMany({ where: { id }, data: { status } })
    if (res.count !== 1) return false
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
    return true
  })
  if (!updated) return { ok: false as const, error: 'Inquiry not found.' }
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

/* ------------------------------------------------------------------ website accounts (D-40) */

const PUBLIC_TYPE_LABEL: Record<string, string> = {
  CONSULTATION: 'Consultation',
  VALUATION: 'Valuation',
  LIST_PROPERTY: 'List with us',
  PROPERTY_INQUIRY: 'Viewing request',
  PROJECT_BRIEFING: 'Project briefing',
}

const PUBLIC_STATUS_LABEL: Record<string, string> = {
  NEW: 'Received',
  CONTACTED: 'In progress',
  CLOSED: 'Closed',
}

/**
 * The requests a website account sent while signed in, newest first. Only what the visitor
 * typed and a plain status: no internal fields (IP hash, user agent, staff notes).
 */
export async function listCustomerInquiries(customerId: string, take = 50) {
  await ensureReady()
  const links = await prisma.customerInquiry.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take,
  })
  if (links.length === 0) return []
  const rows = await prisma.inquiry.findMany({
    where: { id: { in: links.map((l) => l.inquiryId) } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, type: true, interest: true, context: true, status: true, createdAt: true },
  })
  return rows.map((row) => ({
    id: row.id,
    type: PUBLIC_TYPE_LABEL[row.type] ?? 'Request',
    interest: row.interest,
    context: row.context,
    status: PUBLIC_STATUS_LABEL[row.status] ?? 'Received',
    createdAt: row.createdAt,
  }))
}

type LinkClient = Pick<typeof prisma, 'customerInquiry'>

/**
 * Account deletion: the requests stay with the company (they were sent to it), only the link
 * to the deleted account goes.
 */
export async function unlinkCustomerInquiries(customerId: string, db: LinkClient = prisma) {
  await db.customerInquiry.deleteMany({ where: { customerId } })
}

/** Counts per account for the admin list. */
export async function countCustomerInquiries(customerIds: string[]) {
  if (customerIds.length === 0) return new Map<string, number>()
  const groups = await prisma.customerInquiry.groupBy({
    by: ['customerId'],
    where: { customerId: { in: customerIds } },
    _count: { _all: true },
  })
  return new Map(groups.map((g) => [g.customerId, g._count._all]))
}
