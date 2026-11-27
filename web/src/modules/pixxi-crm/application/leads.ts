import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import {
  buildPixxiLeadPayload,
  nextPixxiRetryDelay,
  PIXXI_MAX_ATTEMPTS,
  readPixxiConfig,
  resolvePixxiForm,
  type LeadSubmissionInput,
} from '../domain/pixxi'
import { submitPixxiLeadForm } from '../infrastructure/client'

const LEASE_MS = 5 * 60_000

type LeadOutboxTx = Pick<typeof prisma, 'pixxiLeadOutbox' | 'pixxiLink' | 'property' | 'project'>

/**
 * Resolves the Pixxi propertyId if the enquiry came from a synced property/project page,
 * and writes a PixxiLeadOutbox row inside the caller's transaction (persist before notifying).
 */
export async function queuePixxiLead(
  inquiry: LeadSubmissionInput & {
    listingType?: 'PROPERTY' | 'PROJECT'
    listingId?: string
  },
  db: LeadOutboxTx = prisma,
  env: Record<string, string | undefined> = process.env,
): Promise<void> {
  let pixxiPropertyId: string | null = null

  if (inquiry.listingType && inquiry.listingId) {
    const link = await db.pixxiLink.findUnique({
      where: {
        entityType_entityId: { entityType: inquiry.listingType, entityId: inquiry.listingId },
      },
      select: { pixxiId: true },
    })
    pixxiPropertyId = link?.pixxiId ?? null
  } else if (inquiry.pagePath) {
    const propMatch = /^\/properties\/([a-z0-9-]+)$/i.exec(inquiry.pagePath)
    const projMatch = /^\/projects\/([a-z0-9-]+)$/i.exec(inquiry.pagePath)
    if (propMatch) {
      const prop = await db.property.findUnique({
        where: { slug: propMatch[1] },
        select: { id: true },
      })
      if (prop) {
        const link = await db.pixxiLink.findUnique({
          where: { entityType_entityId: { entityType: 'PROPERTY', entityId: prop.id } },
          select: { pixxiId: true },
        })
        pixxiPropertyId = link?.pixxiId ?? null
      }
    } else if (projMatch) {
      const proj = await db.project.findUnique({
        where: { slug: projMatch[1] },
        select: { id: true },
      })
      if (proj) {
        const link = await db.pixxiLink.findUnique({
          where: { entityType_entityId: { entityType: 'PROJECT', entityId: proj.id } },
          select: { pixxiId: true },
        })
        pixxiPropertyId = link?.pixxiId ?? null
      }
    }
  }

  const config = readPixxiConfig(env)
  const form = resolvePixxiForm(inquiry.type, pixxiPropertyId, config)
  const payload = buildPixxiLeadPayload(inquiry, pixxiPropertyId, form)

  await db.pixxiLeadOutbox.create({
    data: {
      inquiryId: inquiry.id,
      formId: form.formId,
      formName: form.formName,
      pixxiPropertyId,
      payload: JSON.stringify(payload),
    },
  })
}

type LeadSender = (payload: Record<string, unknown>) => Promise<void>

let running: Promise<{ sent: number; failed: number; skipped: boolean }> | null = null
let rerunPending = false

/**
 * Pushes due leads from PixxiLeadOutbox to Pixxi CRM.
 * Safe to call repeatedly: atomic row lease prevents duplicate delivery, and when
 * PIXXI_API_TOKEN is not configured yet, leads stay queued as PENDING until configured.
 */
export function processPixxiLeadOutbox(
  options: {
    send?: LeadSender
    now?: () => number
    env?: Record<string, string | undefined>
  } = {},
) {
  const config = readPixxiConfig(options.env)
  if (!options.send && (!config.enabled || !config.forms.general.formId)) {
    return Promise.resolve({ sent: 0, failed: 0, skipped: true })
  }
  if (running) {
    if (!options.send) rerunPending = true
    return running
  }
  running = runLeadBatch(options, config).finally(() => {
    running = null
    if (rerunPending) {
      rerunPending = false
      const latest = readPixxiConfig()
      if (latest.enabled && latest.forms.general.formId) {
        processPixxiLeadOutbox().catch((err) =>
          console.error('[pixxi] follow-up lead push failed', err),
        )
      }
    }
  })
  return running
}

async function runLeadBatch(
  options: { send?: LeadSender; now?: () => number },
  config: ReturnType<typeof readPixxiConfig>,
) {
  const now = options.now ?? Date.now
  const send: LeadSender =
    options.send ??
    ((payload) =>
      submitPixxiLeadForm({
        apiToken: config.apiToken,
        baseUrl: config.baseUrl,
        payload,
      }))

  let sent = 0
  let failed = 0
  const due = await prisma.pixxiLeadOutbox.findMany({
    where: { status: 'PENDING', nextAttemptAt: { lte: new Date(now()) } },
    orderBy: { createdAt: 'asc' },
    take: 25,
  })

  for (const row of due) {
    const claim = await prisma.pixxiLeadOutbox.updateMany({
      where: { id: row.id, status: 'PENDING', attempts: row.attempts },
      data: { attempts: row.attempts + 1, nextAttemptAt: new Date(now() + LEASE_MS) },
    })
    if (claim.count !== 1) continue

    const attempts = row.attempts + 1
    try {
      const parsed = JSON.parse(row.payload) as Record<string, unknown>
      // Re-resolve formId/formName from live env if lead was queued before Pixxi was configured.
      const extra =
        parsed.extraData && typeof parsed.extraData === 'object'
          ? (parsed.extraData as Record<string, unknown>)
          : {}
      const inquiryType = typeof extra.inquiryType === 'string' ? extra.inquiryType : 'CONSULTATION'
      const resolved = resolvePixxiForm(inquiryType, row.pixxiPropertyId, config)
      const formId = row.formId || resolved.formId
      const formName = row.formName || resolved.formName
      if (!formId) throw new Error('PIXXI_FORM_GENERAL_ID is not configured.')

      const outbound = { ...parsed, formId, formName }
      await send(outbound)
      await prisma.pixxiLeadOutbox.update({
        where: { id: row.id },
        data: {
          formId,
          formName,
          status: 'SENT',
          sentAt: new Date(now()),
          lastError: null,
        },
      })
      sent++
    } catch (error) {
      const delay = nextPixxiRetryDelay(attempts)
      const message = error instanceof Error ? error.message : String(error)
      await prisma.pixxiLeadOutbox.update({
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

/** Admin action: retry failed/pending leads in PixxiLeadOutbox immediately. */
export async function retryPixxiLeads(actor: Actor, id?: string) {
  authorize(actor, 'crm.manage')
  await ensureReady()
  const config = readPixxiConfig()
  if (!config.enabled) return { ok: false as const, error: 'PIXXI_API_TOKEN is not configured yet.' }
  if (!config.forms.general.formId) {
    return { ok: false as const, error: 'PIXXI_FORM_GENERAL_ID is not configured yet.' }
  }
  if (running) await running.catch(() => undefined)
  const now = new Date()
  const scope = {
    ...(id ? { id } : {}),
    OR: [{ status: 'FAILED' }, { status: 'PENDING', nextAttemptAt: { lte: now } }],
  }
  await prisma.pixxiLeadOutbox.updateMany({
    where: { ...scope, attempts: { gte: PIXXI_MAX_ATTEMPTS } },
    data: { attempts: PIXXI_MAX_ATTEMPTS - 1 },
  })
  await prisma.pixxiLeadOutbox.updateMany({
    where: scope,
    data: { status: 'PENDING', nextAttemptAt: now },
  })
  await recordAudit({
    actor,
    action: 'crm.leads_retried',
    targetType: 'PixxiLeadOutbox',
    targetId: id ?? 'all',
  })
  const result = await processPixxiLeadOutbox()
  return { ok: true as const, ...result }
}

let leadTimer: ReturnType<typeof setInterval> | null = null

export function startPixxiLeadWorker(intervalMs = 60_000) {
  const config = readPixxiConfig()
  if (leadTimer || !config.enabled || !config.forms.general.formId || process.env.NODE_ENV === 'test') {
    return
  }
  leadTimer = setInterval(() => {
    processPixxiLeadOutbox().catch((err) => console.error('[pixxi] lead worker failed', err))
  }, intervalMs)
  leadTimer.unref?.()
}
