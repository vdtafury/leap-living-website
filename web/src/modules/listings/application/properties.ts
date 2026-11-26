import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import { propertyInputSchema, propertyPublishProblems, toPropertyListing } from '../domain/property'
import { PUBLIC_WHERE, slugify, type PublicationStatus } from '../domain/shared'

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

/* ------------------------------------------------------------------ public (published only) */

const PUBLIC_ORDER = [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }]

export async function listPublishedProperties(filter: { transactionType?: 'BUY' | 'RENT' } = {}) {
  await ensureReady()
  const rows = await prisma.property.findMany({
    where: { ...PUBLIC_WHERE, ...filter },
    orderBy: PUBLIC_ORDER,
  })
  return rows.map(toPropertyListing)
}

export async function getPublishedProperty(slug: string) {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null
  await ensureReady()
  const row = await prisma.property.findFirst({ where: { ...PUBLIC_WHERE, slug } })
  return row ? toPropertyListing(row) : null
}

/** Published properties among `ids` (saved items); unpublished or deleted ones are left out. */
export async function listPublishedPropertiesByIds(ids: string[]) {
  if (ids.length === 0) return []
  await ensureReady()
  const rows = await prisma.property.findMany({ where: { ...PUBLIC_WHERE, id: { in: ids } } })
  return rows.map(toPropertyListing)
}

/* ------------------------------------------------------------------ admin */

export async function listPropertiesAdmin(
  actor: Actor,
  { status, q, deleted = false }: { status?: string; q?: string; deleted?: boolean } = {},
) {
  authorize(actor, 'property.view')
  await ensureReady()
  const text = q?.trim().slice(0, 80)
  return prisma.property.findMany({
    where: {
      deletedAt: deleted ? { not: null } : null,
      ...(status ? { publicationStatus: status } : {}),
      ...(text
        ? {
            OR: [
              { title: { contains: text } },
              { referenceNumber: { contains: text.toUpperCase() } },
              { community: { contains: text } },
            ],
          }
        : {}),
    },
    orderBy: [{ updatedAt: 'desc' }],
  })
}

export async function getPropertyAdmin(actor: Actor, id: string) {
  authorize(actor, 'property.view')
  await ensureReady()
  return prisma.property.findUnique({ where: { id } })
}

async function uniqueProblem(slug: string, reference: string, exceptId?: string) {
  const clash = await prisma.property.findFirst({
    where: {
      OR: [{ slug }, { referenceNumber: reference }],
      NOT: exceptId ? { id: exceptId } : undefined,
    },
    select: { slug: true },
  })
  if (!clash) return null
  return clash.slug === slug
    ? 'Another listing uses this URL slug.'
    : 'This reference number is taken.'
}

function toData(input: ReturnType<typeof propertyInputSchema.parse>) {
  const { highlights, images, permitNumber, slug, ...rest } = input
  return {
    ...rest,
    slug: slug || slugify(input.title),
    highlights: JSON.stringify(highlights),
    images: JSON.stringify(images),
    permitNumber: permitNumber || null,
  }
}

const VALID_PUBLICATION_STATUSES = new Set<string>(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
const isPrismaCode = (error: unknown, code: string) =>
  Boolean(error && typeof error === 'object' && 'code' in error && error.code === code)

export async function createProperty(actor: Actor, raw: unknown): Promise<Result<{ id: string }>> {
  authorize(actor, 'property.edit')
  await ensureReady()
  const parsed = propertyInputSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const data = toData(parsed.data)
  if (!data.slug) return { ok: false, error: 'Enter a URL slug.' }
  const clash = await uniqueProblem(data.slug, data.referenceNumber)
  if (clash) return { ok: false, error: clash }
  try {
    const row = await prisma.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: { ...data, publicationStatus: 'DRAFT', createdById: actor.id, updatedById: actor.id },
      })
      await recordAudit(
        {
          actor,
          action: 'property.created',
          targetType: 'Property',
          targetId: created.id,
          metadata: { ref: created.referenceNumber },
        },
        tx,
      )
      return created
    })
    return { ok: true, id: row.id }
  } catch (error) {
    if (isPrismaCode(error, 'P2002')) {
      return { ok: false, error: 'This URL slug or reference number is already taken.' }
    }
    throw error
  }
}

export async function updateProperty(actor: Actor, id: string, raw: unknown): Promise<Result> {
  authorize(actor, 'property.edit')
  await ensureReady()
  const parsed = propertyInputSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const data = toData(parsed.data)
  if (!data.slug) return { ok: false, error: 'Enter a URL slug.' }
  const clash = await uniqueProblem(data.slug, data.referenceNumber, id)
  if (clash) return { ok: false, error: clash }
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.property.findUnique({ where: { id } })
      if (!existing || existing.deletedAt) return { ok: false as const, error: 'Listing not found.' }
      if (existing.publicationStatus === 'PUBLISHED') {
        const problems = propertyPublishProblems(data)
        if (problems.length) {
          return { ok: false as const, error: `A published listing needs: ${problems.join(' ')}` }
        }
      }
      await tx.property.update({ where: { id }, data: { ...data, updatedById: actor.id } })
      await recordAudit(
        { actor, action: 'property.updated', targetType: 'Property', targetId: id },
        tx,
      )
      return { ok: true as const }
    })
  } catch (error) {
    if (isPrismaCode(error, 'P2002')) {
      return { ok: false, error: 'This URL slug or reference number is already taken.' }
    }
    throw error
  }
}

export async function setPropertyPublication(
  actor: Actor,
  id: string,
  status: PublicationStatus,
): Promise<Result> {
  authorize(actor, 'property.publish')
  if (!VALID_PUBLICATION_STATUSES.has(status)) return { ok: false, error: 'Unknown status.' }
  await ensureReady()
  return prisma.$transaction(async (tx) => {
    const existing = await tx.property.findUnique({ where: { id } })
    if (!existing || existing.deletedAt) return { ok: false as const, error: 'Listing not found.' }
    if (status === 'PUBLISHED') {
      const problems = propertyPublishProblems(existing)
      if (problems.length) return { ok: false as const, error: problems.join(' ') }
    }
    await tx.property.update({
      where: { id },
      data: {
        publicationStatus: status,
        publishedAt: status === 'PUBLISHED' ? new Date() : existing.publishedAt,
        updatedById: actor.id,
      },
    })
    await recordAudit(
      {
        actor,
        action: `property.${status.toLowerCase()}`,
        targetType: 'Property',
        targetId: id,
        metadata: { from: existing.publicationStatus },
      },
      tx,
    )
    return { ok: true as const }
  })
}

/** Soft delete: the row stays (audit, restore) but is never shown publicly. */
export async function deleteProperty(actor: Actor, id: string, restore = false): Promise<Result> {
  authorize(actor, 'property.delete')
  await ensureReady()
  return prisma.$transaction(async (tx) => {
    const existing = await tx.property.findUnique({ where: { id } })
    if (!existing) return { ok: false as const, error: 'Listing not found.' }
    if (restore && !existing.deletedAt) return { ok: false as const, error: 'Listing is already active.' }
    if (!restore && existing.deletedAt) return { ok: false as const, error: 'Listing is already deleted.' }
    await tx.property.update({
      where: { id },
      data: restore
        ? { deletedAt: null, publicationStatus: 'DRAFT', updatedById: actor.id }
        : { deletedAt: new Date(), updatedById: actor.id },
    })
    await recordAudit(
      {
        actor,
        action: restore ? 'property.restored' : 'property.deleted',
        targetType: 'Property',
        targetId: id,
      },
      tx,
    )
    return { ok: true as const }
  })
}
