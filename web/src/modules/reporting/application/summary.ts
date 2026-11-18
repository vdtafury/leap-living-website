import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { authorize, can, type Actor } from '@/modules/authorization'

async function countBy(rows: Promise<{ publicationStatus: string }[]>) {
  const counts: Record<string, number> = {}
  for (const row of await rows)
    counts[row.publicationStatus] = (counts[row.publicationStatus] ?? 0) + 1
  return counts
}

/** Dashboard figures. Each block appears only if the user may see that area. */
export async function dashboardSummary(actor: Actor) {
  authorize(actor, 'dashboard.view')
  await ensureReady()
  const notDeleted = { deletedAt: null }
  const [properties, projects, inquiries, outbox, recent] = await Promise.all([
    can(actor, 'property.view')
      ? countBy(
          prisma.property.findMany({ where: notDeleted, select: { publicationStatus: true } }),
        )
      : null,
    can(actor, 'project.view')
      ? countBy(prisma.project.findMany({ where: notDeleted, select: { publicationStatus: true } }))
      : null,
    can(actor, 'inquiry.view')
      ? Promise.all([
          prisma.inquiry.count({ where: { status: 'NEW' } }),
          prisma.inquiry.count({
            where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          }),
        ]).then(([fresh, week]) => ({ new: fresh, week }))
      : null,
    can(actor, 'email.view')
      ? Promise.all([
          prisma.emailOutbox.count({ where: { status: 'PENDING' } }),
          prisma.emailOutbox.count({ where: { status: 'FAILED' } }),
        ]).then(([pending, failed]) => ({ pending, failed }))
      : null,
    can(actor, 'audit.view')
      ? prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 })
      : null,
  ])
  return { properties, projects, inquiries, outbox, recent }
}
