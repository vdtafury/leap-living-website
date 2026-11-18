import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import { developerInputSchema, toDeveloperBrand } from '../domain/developer'

type Result = { ok: true } | { ok: false; error: string }
const ORDER = [{ sortOrder: 'asc' as const }, { name: 'asc' as const }]

export async function listVisibleDevelopers() {
  await ensureReady()
  const rows = await prisma.developer.findMany({ where: { isVisible: true }, orderBy: ORDER })
  return rows.map(toDeveloperBrand)
}

export async function listDevelopersAdmin(actor: Actor) {
  authorize(actor, 'developer.manage')
  await ensureReady()
  return prisma.developer.findMany({ orderBy: ORDER })
}

export async function saveDeveloper(
  actor: Actor,
  id: string | null,
  raw: unknown,
): Promise<Result> {
  authorize(actor, 'developer.manage')
  const parsed = developerInputSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const data = parsed.data
  const clash = await prisma.developer.findFirst({
    where: { name: data.name, NOT: id ? { id } : undefined },
  })
  if (clash) return { ok: false, error: 'A developer with this name exists.' }
  await prisma.$transaction(async (tx) => {
    const row = id
      ? await tx.developer.update({ where: { id }, data })
      : await tx.developer.create({ data })
    await recordAudit(
      {
        actor,
        action: id ? 'developer.updated' : 'developer.created',
        targetType: 'Developer',
        targetId: row.id,
        metadata: { name: row.name },
      },
      tx,
    )
  })
  return { ok: true }
}

export async function deleteDeveloper(actor: Actor, id: string): Promise<Result> {
  authorize(actor, 'developer.manage')
  const row = await prisma.developer.findUnique({ where: { id } })
  if (!row) return { ok: false, error: 'Not found.' }
  await prisma.$transaction(async (tx) => {
    await tx.developer.delete({ where: { id } })
    await recordAudit(
      {
        actor,
        action: 'developer.deleted',
        targetType: 'Developer',
        targetId: id,
        metadata: { name: row.name },
      },
      tx,
    )
  })
  return { ok: true }
}

/** Moves a developer one place up or down in the strip (swaps sort orders, renumbers). */
export async function moveDeveloper(actor: Actor, id: string, direction: -1 | 1): Promise<Result> {
  authorize(actor, 'developer.manage')
  const rows = await prisma.developer.findMany({ orderBy: ORDER })
  const index = rows.findIndex((r) => r.id === id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= rows.length) return { ok: true }
  ;[rows[index], rows[target]] = [rows[target], rows[index]]
  await prisma.$transaction(async (tx) => {
    for (const [i, row] of rows.entries()) {
      await tx.developer.update({ where: { id: row.id }, data: { sortOrder: (i + 1) * 10 } })
    }
    await recordAudit(
      { actor, action: 'developer.reordered', targetType: 'Developer', targetId: id },
      tx,
    )
  })
  return { ok: true }
}
