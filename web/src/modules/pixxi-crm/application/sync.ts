import { createHash, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { PROJECTS, PROPERTIES } from '@/data/catalog'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import {
  extractPixxiId,
  mapPixxiToProject,
  mapPixxiToProperty,
  PIXXI_LISTING_TYPES,
  readPixxiConfig,
  type MappedPixxiProject,
  type MappedPixxiProperty,
  type PixxiListingType,
  type PixxiRawListing,
} from '../domain/pixxi'
import { fetchPixxiListingsPage, fetchPixxiSingleListing } from '../infrastructure/client'

const PAGE_SIZE = 50
const MAX_PAGES_PER_TYPE = 50
/** Pixxi API recommends >= 2 seconds between read requests. */
const DEFAULT_PAGE_DELAY_MS = 2_100

const sleep = (ms: number) =>
  ms > 0 ? new Promise<void>((resolve) => setTimeout(resolve, ms)) : Promise.resolve()

const hashPayload = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')

async function upsertPixxiProperty(mapped: MappedPixxiProperty): Promise<'created' | 'updated' | 'unchanged'> {
  const contentHash = hashPayload(mapped)
  const existingLink = await prisma.pixxiLink.findUnique({
    where: { pixxiId: mapped.pixxiId },
  })
  if (
    existingLink &&
    existingLink.entityType === 'PROPERTY' &&
    existingLink.syncStatus === 'ACTIVE' &&
    existingLink.contentHash === contentHash
  ) {
    await prisma.pixxiLink.update({
      where: { pixxiId: mapped.pixxiId },
      data: { lastSyncedAt: new Date() },
    })
    return 'unchanged'
  }

  const now = new Date()
  const data = {
    title: mapped.title,
    subtitle: mapped.subtitle,
    transactionType: mapped.transactionType,
    segment: mapped.segment,
    propertyType: mapped.propertyType,
    publicationStatus: mapped.publicationStatus,
    availabilityStatus: mapped.availabilityStatus,
    highlightLabel: mapped.highlightLabel,
    community: mapped.community,
    emirate: mapped.emirate,
    price: mapped.price,
    currency: mapped.currency,
    priceFrequency: mapped.priceFrequency,
    beds: mapped.beds,
    baths: mapped.baths,
    area: mapped.area,
    areaUnit: mapped.areaUnit,
    completionStatus: mapped.completionStatus,
    developer: mapped.developer,
    description: mapped.description,
    highlights: JSON.stringify(mapped.highlights),
    images: JSON.stringify(mapped.images),
    permitNumber: mapped.permitNumber,
    deletedAt: null,
    publishedAt: mapped.publicationStatus === 'PUBLISHED' ? now : null,
  }

  if (existingLink && existingLink.entityType === 'PROPERTY') {
    await prisma.$transaction(async (tx) => {
      // Preserve admin-curated `featured`, `sortOrder`, and `slug` on updates.
      await tx.property.update({
        where: { id: existingLink.entityId },
        data,
      })
      await tx.pixxiLink.update({
        where: { pixxiId: mapped.pixxiId },
        data: {
          listingType: mapped.listingType,
          syncStatus: 'ACTIVE',
          contentHash,
          lastSyncedAt: now,
        },
      })
    })
    return 'updated'
  }

  // Ensure slug & referenceNumber are unique before creating.
  const clash = await prisma.property.findFirst({
    where: { OR: [{ slug: mapped.slug }, { referenceNumber: mapped.referenceNumber }] },
    select: { slug: true, referenceNumber: true },
  })
  const suffix = hashPayload(mapped.pixxiId).slice(0, 6)
  const slug = clash?.slug === mapped.slug ? `${mapped.slug.slice(0, 110)}-${suffix}` : mapped.slug
  const referenceNumber =
    clash?.referenceNumber === mapped.referenceNumber
      ? `${mapped.referenceNumber.slice(0, 23)}-${suffix.toUpperCase()}`
      : mapped.referenceNumber

  await prisma.$transaction(async (tx) => {
    const created = await tx.property.create({
      data: {
        ...data,
        slug,
        referenceNumber,
        featured: false,
        sortOrder: 0,
      },
      select: { id: true },
    })
    await tx.pixxiLink.upsert({
      where: { pixxiId: mapped.pixxiId },
      create: {
        entityType: 'PROPERTY',
        entityId: created.id,
        pixxiId: mapped.pixxiId,
        pixxiNumericId: mapped.pixxiNumericId,
        listingType: mapped.listingType,
        syncStatus: 'ACTIVE',
        contentHash,
        lastSyncedAt: now,
      },
      update: {
        entityType: 'PROPERTY',
        entityId: created.id,
        pixxiNumericId: mapped.pixxiNumericId,
        listingType: mapped.listingType,
        syncStatus: 'ACTIVE',
        contentHash,
        lastSyncedAt: now,
      },
    })
  })
  return 'created'
}

async function upsertPixxiProject(mapped: MappedPixxiProject): Promise<'created' | 'updated' | 'unchanged'> {
  const contentHash = hashPayload(mapped)
  const existingLink = await prisma.pixxiLink.findUnique({
    where: { pixxiId: mapped.pixxiId },
  })
  if (
    existingLink &&
    existingLink.entityType === 'PROJECT' &&
    existingLink.syncStatus === 'ACTIVE' &&
    existingLink.contentHash === contentHash
  ) {
    await prisma.pixxiLink.update({
      where: { pixxiId: mapped.pixxiId },
      data: { lastSyncedAt: new Date() },
    })
    return 'unchanged'
  }

  const now = new Date()
  const data = {
    title: mapped.title,
    developer: mapped.developer,
    community: mapped.community,
    segment: mapped.segment,
    status: mapped.status,
    publicationStatus: mapped.publicationStatus,
    startingPrice: mapped.startingPrice,
    currency: mapped.currency,
    handoverLabel: mapped.handoverLabel,
    paymentPlan: mapped.paymentPlan,
    unitTypes: mapped.unitTypes,
    overview: mapped.overview,
    keyFacts: JSON.stringify(mapped.keyFacts),
    amenities: JSON.stringify(mapped.amenities),
    images: JSON.stringify(mapped.images),
    deletedAt: null,
    publishedAt: mapped.publicationStatus === 'PUBLISHED' ? now : null,
  }

  if (existingLink && existingLink.entityType === 'PROJECT') {
    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: existingLink.entityId },
        data,
      })
      await tx.pixxiLink.update({
        where: { pixxiId: mapped.pixxiId },
        data: {
          listingType: mapped.listingType,
          syncStatus: 'ACTIVE',
          contentHash,
          lastSyncedAt: now,
        },
      })
    })
    return 'updated'
  }

  const clash = await prisma.project.findFirst({
    where: { OR: [{ slug: mapped.slug }, { referenceNumber: mapped.referenceNumber }] },
    select: { slug: true, referenceNumber: true },
  })
  const suffix = hashPayload(mapped.pixxiId).slice(0, 6)
  const slug = clash?.slug === mapped.slug ? `${mapped.slug.slice(0, 110)}-${suffix}` : mapped.slug
  const referenceNumber =
    clash?.referenceNumber === mapped.referenceNumber
      ? `${mapped.referenceNumber.slice(0, 23)}-${suffix.toUpperCase()}`
      : mapped.referenceNumber

  await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        ...data,
        slug,
        referenceNumber,
        featured: false,
        sortOrder: 0,
      },
      select: { id: true },
    })
    await tx.pixxiLink.upsert({
      where: { pixxiId: mapped.pixxiId },
      create: {
        entityType: 'PROJECT',
        entityId: created.id,
        pixxiId: mapped.pixxiId,
        pixxiNumericId: mapped.pixxiNumericId,
        listingType: mapped.listingType,
        syncStatus: 'ACTIVE',
        contentHash,
        lastSyncedAt: now,
      },
      update: {
        entityType: 'PROJECT',
        entityId: created.id,
        pixxiNumericId: mapped.pixxiNumericId,
        listingType: mapped.listingType,
        syncStatus: 'ACTIVE',
        contentHash,
        lastSyncedAt: now,
      },
    })
  })
  return 'created'
}

async function archivePixxiItem(pixxiId: string): Promise<boolean> {
  const link = await prisma.pixxiLink.findUnique({ where: { pixxiId } })
  if (!link || link.syncStatus === 'REMOVED') return false
  await prisma.$transaction(async (tx) => {
    if (link.entityType === 'PROPERTY') {
      await tx.property.updateMany({
        where: { id: link.entityId },
        data: { publicationStatus: 'ARCHIVED' },
      })
    } else {
      await tx.project.updateMany({
        where: { id: link.entityId },
        data: { publicationStatus: 'ARCHIVED' },
      })
    }
    await tx.pixxiLink.update({
      where: { pixxiId },
      data: { syncStatus: 'REMOVED', lastSyncedAt: new Date() },
    })
  })
  return true
}

/** Archives the initial placeholder catalog once real Pixxi listings are present. */
async function archiveStarterSamples() {
  const starterPropRefs = PROPERTIES.map((p) => p.refCode)
  const starterProjRefs = PROJECTS.map((p) => p.refCode)
  const linked = await prisma.pixxiLink.findMany({ select: { entityType: true, entityId: true } })
  const linkedPropIds = linked.filter((l) => l.entityType === 'PROPERTY').map((l) => l.entityId)
  const linkedProjIds = linked.filter((l) => l.entityType === 'PROJECT').map((l) => l.entityId)

  await prisma.$transaction([
    prisma.property.updateMany({
      where: {
        referenceNumber: { in: starterPropRefs },
        publicationStatus: 'PUBLISHED',
        ...(linkedPropIds.length > 0 ? { id: { notIn: linkedPropIds } } : {}),
      },
      data: { publicationStatus: 'ARCHIVED' },
    }),
    prisma.project.updateMany({
      where: {
        referenceNumber: { in: starterProjRefs },
        publicationStatus: 'PUBLISHED',
        ...(linkedProjIds.length > 0 ? { id: { notIn: linkedProjIds } } : {}),
      },
      data: { publicationStatus: 'ARCHIVED' },
    }),
  ])
}

export type SyncResult =
  | {
      ok: true
      fetched: number
      created: number
      updated: number
      archived: number
      errors: number
    }
  | { ok: false; error: string }

let syncInFlight: Promise<SyncResult> | null = null

/**
 * Full catalog sync from Pixxi CRM (SELL, RENT, NEW off-plan projects) into local SQLite.
 * Enforces Pixxi's 2-second interval between paginated read calls and archives removed items.
 */
export async function syncPixxiCatalog(options: {
  trigger: 'MANUAL' | 'SCHEDULED' | 'WEBHOOK'
  actor?: Actor
  env?: Record<string, string | undefined>
  fetchImpl?: typeof fetch
  pageDelayMs?: number
}): Promise<SyncResult> {
  if (options.actor) authorize(options.actor, 'crm.manage')
  await ensureReady()
  const config = readPixxiConfig(options.env)
  if (!config.enabled) {
    return { ok: false, error: 'PIXXI_API_TOKEN is not configured yet.' }
  }
  if (syncInFlight) {
    return { ok: false, error: 'A Pixxi sync is already running. Try again shortly.' }
  }

  const runPromise = (async (): Promise<SyncResult> => {
    const run = await prisma.pixxiSyncRun.create({
      data: { trigger: options.trigger, status: 'RUNNING' },
      select: { id: true },
    })
    const seenIds = new Set<string>()
    let fetched = 0
    let created = 0
    let updated = 0
    let archived = 0
    let errors = 0
    const delayMs = options.pageDelayMs ?? DEFAULT_PAGE_DELAY_MS
    let requestIndex = 0

    try {
      for (const listingType of PIXXI_LISTING_TYPES) {
        let page = 1
        while (page <= MAX_PAGES_PER_TYPE) {
          if (requestIndex > 0) await sleep(delayMs)
          requestIndex++
          const res = await fetchPixxiListingsPage({
            apiToken: config.apiToken,
            baseUrl: config.baseUrl,
            listingType,
            page,
            size: PAGE_SIZE,
            fetchImpl: options.fetchImpl,
          })
          if (res.list.length === 0) break

          for (const raw of res.list) {
            fetched++
            try {
              if (listingType === 'NEW') {
                const mapped = mapPixxiToProject(raw)
                if (!mapped) {
                  errors++
                  continue
                }
                seenIds.add(mapped.pixxiId)
                const outcome = await upsertPixxiProject(mapped)
                if (outcome === 'created') created++
                else if (outcome === 'updated') updated++
              } else {
                const mapped = mapPixxiToProperty(raw, listingType)
                if (!mapped) {
                  errors++
                  continue
                }
                seenIds.add(mapped.pixxiId)
                const outcome = await upsertPixxiProperty(mapped)
                if (outcome === 'created') created++
                else if (outcome === 'updated') updated++
              }
            } catch {
              errors++
            }
          }

          if (res.list.length < PAGE_SIZE || page * PAGE_SIZE >= res.totalSize) break
          page++
        }
      }

      // Archive previously-synced listings that Pixxi no longer returns (only when full sync succeeded).
      const activeLinks = await prisma.pixxiLink.findMany({
        where: { syncStatus: 'ACTIVE' },
        select: { pixxiId: true },
      })
      for (const link of activeLinks) {
        if (!seenIds.has(link.pixxiId)) {
          if (await archivePixxiItem(link.pixxiId)) archived++
        }
      }

      if (config.hideStarterOnSync && seenIds.size > 0) {
        await archiveStarterSamples()
      }

      const summary = `Fetched ${fetched}: ${created} created, ${updated} updated, ${archived} archived${errors ? `, ${errors} skipped` : ''}.`
      await prisma.pixxiSyncRun.update({
        where: { id: run.id },
        data: {
          status: 'OK',
          fetched,
          created,
          updated,
          archived,
          errors,
          message: summary,
          finishedAt: new Date(),
        },
      })
      await recordAudit({
        actor: options.actor ?? null,
        action: 'crm.sync_completed',
        targetType: 'PixxiSyncRun',
        targetId: run.id,
        metadata: { trigger: options.trigger, fetched, created, updated, archived, errors },
      })
      return { ok: true, fetched, created, updated, archived, errors }
    } catch (error) {
      const message = (error instanceof Error ? error.message : String(error)).slice(0, 400)
      await prisma.pixxiSyncRun.update({
        where: { id: run.id },
        data: {
          status: 'ERROR',
          fetched,
          created,
          updated,
          archived,
          errors: errors + 1,
          message,
          finishedAt: new Date(),
        },
      })
      await recordAudit({
        actor: options.actor ?? null,
        action: 'crm.sync_failed',
        targetType: 'PixxiSyncRun',
        targetId: run.id,
        metadata: { trigger: options.trigger, error: message },
      })
      return { ok: false, error: message }
    }
  })()

  syncInFlight = runPromise.finally(() => {
    syncInFlight = null
  })
  return syncInFlight
}

function secretValid(expected: string, provided: string | null): boolean {
  if (!expected) return true
  if (!provided || provided.length > 200) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(provided)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Handles incoming Pixxi CRM listing webhooks:
 * ADD_LISTINGS / EventADD_LISTINGS, UPDATE_LISTINGS / EventUPDATE_LISTINGS,
 * DELETE_LISTINGS / EventDELETE_LISTINGS.
 */
export async function handlePixxiWebhookEvent({
  body,
  providedSecret,
  env = process.env,
  fetchImpl = fetch,
}: {
  body: unknown
  providedSecret: string | null
  env?: Record<string, string | undefined>
  fetchImpl?: typeof fetch
}): Promise<{ ok: true; action: string } | { ok: false; status: number; error: string }> {
  const config = readPixxiConfig(env)
  if (!config.enabled) return { ok: false, status: 503, error: 'Pixxi CRM is not configured.' }
  if (!config.webhookSecret) {
    return { ok: false, status: 503, error: 'PIXXI_WEBHOOK_SECRET is not configured.' }
  }
  if (!secretValid(config.webhookSecret, providedSecret)) {
    return { ok: false, status: 401, error: 'Unauthorized webhook.' }
  }

  await ensureReady()
  const payload = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const event = String(payload.event ?? payload.eventType ?? payload.type ?? '').trim()
  const normalizedEvent = event.replace(/^Event/i, '').toUpperCase()
  const dataObj = (
    payload.data && typeof payload.data === 'object' ? payload.data : payload
  ) as PixxiRawListing
  const ids = extractPixxiId(dataObj)

  if (normalizedEvent === 'DELETE_LISTINGS') {
    if (!ids) return { ok: true, action: 'ignored_missing_id' }
    const didArchive = await archivePixxiItem(ids.pixxiId)
    await recordAudit({
      action: 'crm.webhook_delete',
      targetType: 'PixxiLink',
      targetId: ids.pixxiId,
      metadata: { event, archived: didArchive },
    })
    return { ok: true, action: didArchive ? 'archived' : 'not_found' }
  }

  if (normalizedEvent === 'ADD_LISTINGS' || normalizedEvent === 'UPDATE_LISTINGS') {
    if (!ids) return { ok: true, action: 'ignored_missing_id' }
    const fresh =
      (await fetchPixxiSingleListing({
        apiToken: config.apiToken,
        baseUrl: config.baseUrl,
        propertyId: ids.pixxiId,
        fetchImpl,
      }).catch(() => null)) ?? dataObj

    const rawType = String(fresh.listingType ?? '').toUpperCase() as PixxiListingType
    let outcome = 'ignored'
    if (rawType === 'NEW') {
      const mapped = mapPixxiToProject(fresh)
      if (mapped) outcome = await upsertPixxiProject(mapped)
    } else {
      const mapped = mapPixxiToProperty(fresh, rawType === 'RENT' ? 'RENT' : 'SELL')
      if (mapped) outcome = await upsertPixxiProperty(mapped)
    }
    await recordAudit({
      action: 'crm.webhook_upsert',
      targetType: 'PixxiLink',
      targetId: ids.pixxiId,
      metadata: { event, outcome },
    })
    return { ok: true, action: outcome }
  }

  return { ok: true, action: 'ignored_event' }
}

/** Status summary for /admin/crm (never exposes raw secrets). */
export async function getPixxiStatus(
  actor: Actor,
  env: Record<string, string | undefined> = process.env,
) {
  authorize(actor, 'crm.view')
  await ensureReady()
  const config = readPixxiConfig(env)
  const [links, leadCounts, recentRuns, recentLeads] = await Promise.all([
    prisma.pixxiLink.groupBy({
      by: ['entityType', 'syncStatus'],
      _count: { _all: true },
    }),
    prisma.pixxiLeadOutbox.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.pixxiSyncRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 15,
    }),
    prisma.pixxiLeadOutbox.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
  ])

  const activeProperties =
    links.find((l) => l.entityType === 'PROPERTY' && l.syncStatus === 'ACTIVE')?._count._all ?? 0
  const activeProjects =
    links.find((l) => l.entityType === 'PROJECT' && l.syncStatus === 'ACTIVE')?._count._all ?? 0
  const counts = Object.fromEntries(leadCounts.map((c) => [c.status, c._count._all])) as Record<
    string,
    number
  >

  return {
    config: {
      tokenConfigured: config.enabled,
      baseUrl: config.baseUrl,
      generalFormConfigured: Boolean(config.forms.general.formId),
      generalFormName: config.forms.general.formName,
      listingFormConfigured: Boolean(config.forms.listing.formId),
      listingFormName: config.forms.listing.formName,
      webhookSecretConfigured: Boolean(config.webhookSecret),
      syncIntervalMinutes: config.syncIntervalMinutes,
      hideStarterOnSync: config.hideStarterOnSync,
    },
    counts: {
      activeProperties,
      activeProjects,
      pendingLeads: counts.PENDING ?? 0,
      sentLeads: counts.SENT ?? 0,
      failedLeads: counts.FAILED ?? 0,
    },
    recentRuns,
    recentLeads,
  }
}

let syncTimer: ReturnType<typeof setInterval> | null = null

export function startPixxiSyncWorker() {
  const config = readPixxiConfig()
  if (syncTimer || !config.enabled || process.env.NODE_ENV === 'test') return
  syncTimer = setInterval(() => {
    syncPixxiCatalog({ trigger: 'SCHEDULED' }).catch((err) =>
      console.error('[pixxi] scheduled sync failed', err),
    )
  }, config.syncIntervalMinutes * 60_000)
  syncTimer.unref?.()
}
