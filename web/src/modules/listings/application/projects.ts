import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import { projectInputSchema, projectPublishProblems, toProjectItem } from '../domain/project'
import type { Result } from './properties'
import { PUBLIC_WHERE, slugify, type PublicationStatus } from '../domain/shared'

/* ------------------------------------------------------------------ public (published only) */

const PUBLIC_ORDER = [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }]

export async function listPublishedProjects(filter: { featured?: boolean } = {}) {
  await ensureReady()
  const rows = await prisma.project.findMany({
    where: { ...PUBLIC_WHERE, ...filter },
    orderBy: PUBLIC_ORDER,
  })
  return rows.map(toProjectItem)
}

export async function getPublishedProject(slug: string) {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null
  await ensureReady()
  const row = await prisma.project.findFirst({ where: { ...PUBLIC_WHERE, slug } })
  return row ? toProjectItem(row) : null
}

/* ------------------------------------------------------------------ admin */

export async function listProjectsAdmin(
  actor: Actor,
  { status, q, deleted = false }: { status?: string; q?: string; deleted?: boolean } = {},
) {
  authorize(actor, 'project.view')
  await ensureReady()
  const text = q?.trim().slice(0, 80)
  return prisma.project.findMany({
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

export async function getProjectAdmin(actor: Actor, id: string) {
  authorize(actor, 'project.view')
  await ensureReady()
  return prisma.project.findUnique({ where: { id } })
}

async function uniqueProblem(slug: string, reference: string, exceptId?: string) {
  const clash = await prisma.project.findFirst({
    where: {
      OR: [{ slug }, { referenceNumber: reference }],
      NOT: exceptId ? { id: exceptId } : undefined,
    },
    select: { slug: true },
  })
  if (!clash) return null
  return clash.slug === slug
    ? 'Another project uses this URL slug.'
    : 'This reference number is taken.'
}

function toData(input: ReturnType<typeof projectInputSchema.parse>) {
  const { keyFacts, amenities, images, slug, ...rest } = input
  return {
    ...rest,
    slug: slug || slugify(input.title),
    keyFacts: JSON.stringify(keyFacts),
    amenities: JSON.stringify(amenities),
    images: JSON.stringify(images),
  }
}

export async function createProject(actor: Actor, raw: unknown): Promise<Result<{ id: string }>> {
  authorize(actor, 'project.edit')
  const parsed = projectInputSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const data = toData(parsed.data)
  if (!data.slug) return { ok: false, error: 'Enter a URL slug.' }
  const clash = await uniqueProblem(data.slug, data.referenceNumber)
  if (clash) return { ok: false, error: clash }
  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: { ...data, publicationStatus: 'DRAFT', createdById: actor.id, updatedById: actor.id },
    })
    await recordAudit(
      {
        actor,
        action: 'project.created',
        targetType: 'Project',
        targetId: created.id,
        metadata: { ref: created.referenceNumber },
      },
      tx,
    )
    return created
  })
  return { ok: true, id: row.id }
}

export async function updateProject(actor: Actor, id: string, raw: unknown): Promise<Result> {
  authorize(actor, 'project.edit')
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing || existing.deletedAt) return { ok: false, error: 'Project not found.' }
  const parsed = projectInputSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const data = toData(parsed.data)
  const clash = await uniqueProblem(data.slug, data.referenceNumber, id)
  if (clash) return { ok: false, error: clash }
  if (existing.publicationStatus === 'PUBLISHED') {
    const problems = projectPublishProblems(data)
    if (problems.length)
      return { ok: false, error: `A published project needs: ${problems.join(' ')}` }
  }
  await prisma.$transaction(async (tx) => {
    await tx.project.update({ where: { id }, data: { ...data, updatedById: actor.id } })
    await recordAudit({ actor, action: 'project.updated', targetType: 'Project', targetId: id }, tx)
  })
  return { ok: true }
}

export async function setProjectPublication(
  actor: Actor,
  id: string,
  status: PublicationStatus,
): Promise<Result> {
  authorize(actor, 'project.publish')
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing || existing.deletedAt) return { ok: false, error: 'Project not found.' }
  if (status === 'PUBLISHED') {
    const problems = projectPublishProblems(existing)
    if (problems.length) return { ok: false, error: problems.join(' ') }
  }
  await prisma.$transaction(async (tx) => {
    await tx.project.update({
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
        action: `project.${status.toLowerCase()}`,
        targetType: 'Project',
        targetId: id,
        metadata: { from: existing.publicationStatus },
      },
      tx,
    )
  })
  return { ok: true }
}

/** Soft delete: the row stays (audit, restore) but is never shown publicly. */
export async function deleteProject(actor: Actor, id: string, restore = false): Promise<Result> {
  authorize(actor, 'project.delete')
  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) return { ok: false, error: 'Project not found.' }
  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: restore
        ? { deletedAt: null, publicationStatus: 'DRAFT', updatedById: actor.id }
        : { deletedAt: new Date(), updatedById: actor.id },
    })
    await recordAudit(
      {
        actor,
        action: restore ? 'project.restored' : 'project.deleted',
        targetType: 'Project',
        targetId: id,
      },
      tx,
    )
  })
  return { ok: true }
}
