import { prisma } from '@/server/db'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import { sendEmail, smtpConfigured, type OutgoingEmail } from '../infrastructure/mailer'

/** Retry schedule after a failed attempt; after the last one the email is marked FAILED. */
export const BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 6 * 60 * 60_000]
export const MAX_ATTEMPTS = BACKOFF_MS.length + 1
/** A claimed email is retried after this long if the process died mid-send. */
const LEASE_MS = 5 * 60_000

export function nextAttemptDelay(attempts: number): number | null {
  return attempts >= MAX_ATTEMPTS ? null : BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)]
}

type Sender = (email: OutgoingEmail) => Promise<void>

let running: Promise<unknown> | null = null

/** Emails whose text carries a one-time link (account confirmation, password reset). */
export const ACCOUNT_EMAIL = 'CustomerToken'
const TOKEN_IN_LINK = /([?&]token=)[\w-]+/g
/** One-time links are never shown in the admin and are wiped from the row once sent. */
export const redactTokens = (text: string) => text.replace(TOKEN_IN_LINK, '$1[hidden]')

export interface QueuedEmail {
  to: string
  subject: string
  text: string
  relatedType?: string
  relatedId?: string
}

type OutboxClient = Pick<typeof prisma, 'emailOutbox'>

/**
 * Puts an email in the outbox (inside the caller's transaction when `db` is given). Call
 * `processOutbox()` after the transaction commits to send it straight away.
 */
export async function queueEmail(email: QueuedEmail, db: OutboxClient = prisma): Promise<void> {
  await db.emailOutbox.create({
    data: {
      to: email.to,
      subject: email.subject.replace(/[\r\n]+/g, ' ').slice(0, 200),
      text: email.text,
      relatedType: email.relatedType ?? null,
      relatedId: email.relatedId ?? null,
    },
  })
}

/**
 * Sends due emails. Safe to call often and from several processes: each row is claimed with a
 * conditional update before sending, so two workers never send the same email.
 */
export function processOutbox(
  options: { send?: Sender; force?: boolean; now?: () => number } = {},
) {
  if (!options.send && !smtpConfigured())
    return Promise.resolve({ sent: 0, failed: 0, skipped: true })
  running ??= run(options).finally(() => {
    running = null
  })
  return running as Promise<{ sent: number; failed: number; skipped: boolean }>
}

async function run({ send = sendEmail, now = Date.now }: { send?: Sender; now?: () => number }) {
  let sent = 0
  let failed = 0
  const due = await prisma.emailOutbox.findMany({
    where: { status: 'PENDING', nextAttemptAt: { lte: new Date(now()) } },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })
  for (const row of due) {
    const claim = await prisma.emailOutbox.updateMany({
      where: { id: row.id, status: 'PENDING', attempts: row.attempts },
      data: { attempts: row.attempts + 1, nextAttemptAt: new Date(now() + LEASE_MS) },
    })
    if (claim.count !== 1) continue
    const attempts = row.attempts + 1
    try {
      const replyTo = row.relatedType === 'Inquiry' ? replyToFrom(row.text) : undefined
      await send({ to: row.to, subject: row.subject, text: row.text, replyTo })
      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: {
          status: 'SENT',
          sentAt: new Date(now()),
          lastError: null,
          ...(row.relatedType === ACCOUNT_EMAIL ? { text: redactTokens(row.text) } : {}),
        },
      })
      sent++
    } catch (error) {
      const delay = nextAttemptDelay(attempts)
      const message = error instanceof Error ? error.message : String(error)
      await prisma.emailOutbox.update({
        where: { id: row.id },
        data: {
          status: delay === null ? 'FAILED' : 'PENDING',
          nextAttemptAt: new Date(now() + (delay ?? 0)),
          lastError: message.slice(0, 500),
        },
      })
      failed++
    }
  }
  return { sent, failed, skipped: false }
}

/** The visitor's address from the notification text ("Email: …"), for Reply-To. */
function replyToFrom(text: string): string | undefined {
  const match = /^Email: ([^\s@]+@[^\s@]+)$/m.exec(text)
  return match?.[1]
}

let timer: ReturnType<typeof setInterval> | null = null

/** Background sender, once per process, only when SMTP is configured. */
export function startOutboxWorker(intervalMs = 60_000) {
  if (timer || !smtpConfigured() || process.env.NODE_ENV === 'test') return
  timer = setInterval(() => {
    processOutbox().catch((error) => console.error('[outbox] run failed', error))
  }, intervalMs)
  timer.unref?.()
}

/* ------------------------------------------------------------------ admin */

export async function listOutbox(actor: Actor, { status }: { status?: string } = {}) {
  authorize(actor, 'email.view')
  const [rows, counts] = await Promise.all([
    prisma.emailOutbox.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.emailOutbox.groupBy({ by: ['status'], _count: { _all: true } }),
  ])
  return {
    rows: rows.map((row) =>
      row.relatedType === ACCOUNT_EMAIL ? { ...row, text: redactTokens(row.text) } : row,
    ),
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])) as Record<
      string,
      number
    >,
    smtpConfigured: smtpConfigured(),
  }
}

/** Re-queues failed emails (or one email) and runs the sender now. */
export async function retryOutbox(actor: Actor, id?: string) {
  authorize(actor, 'email.retry')
  if (!smtpConfigured()) return { ok: false as const, error: 'SMTP is not configured yet.' }
  const scope = { ...(id ? { id } : {}), status: { in: ['FAILED', 'PENDING'] } }
  // One more attempt for emails that used them all up, then due now.
  await prisma.emailOutbox.updateMany({
    where: { ...scope, attempts: { gte: MAX_ATTEMPTS } },
    data: { attempts: MAX_ATTEMPTS - 1 },
  })
  await prisma.emailOutbox.updateMany({
    where: scope,
    data: { status: 'PENDING', nextAttemptAt: new Date() },
  })
  await recordAudit({
    actor,
    action: 'email.retry',
    targetType: 'EmailOutbox',
    targetId: id ?? 'all',
  })
  const result = await processOutbox()
  return { ok: true as const, ...result }
}
