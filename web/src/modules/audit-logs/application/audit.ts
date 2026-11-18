import { prisma } from '@/server/db'
import { authorize, type Actor } from '@/modules/authorization'

/**
 * Audit trail (SECURITY.md §7). Append-only: the application never updates or deletes rows.
 * Metadata must not contain secrets or personal data beyond what identifies the target.
 */
export interface AuditEvent {
  actor?: { id: string; name: string } | null
  action: string
  targetType?: string
  targetId?: string
  ipHash?: string | null
  metadata?: Record<string, unknown>
}

export type AuditClient = Pick<typeof prisma, 'auditLog'>

export async function recordAudit(event: AuditEvent, db: AuditClient = prisma): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: event.actor?.id ?? null,
      actorName: event.actor?.name ?? null,
      action: event.action,
      targetType: event.targetType ?? null,
      targetId: event.targetId ?? null,
      ipHash: event.ipHash ?? null,
      metadata: JSON.stringify(event.metadata ?? {}),
    },
  })
}

export async function listAudit(
  actor: Actor,
  { page = 1, pageSize = 50 }: { page?: number; pageSize?: number } = {},
) {
  authorize(actor, 'audit.view')
  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count(),
  ])
  return { rows, total, page, pageSize }
}
