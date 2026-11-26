import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import { countCustomerInquiries } from '@/modules/inquiries'

const PAGE_SIZE = 50

/** Website accounts for /admin/customers: search by name, email or phone, paginated. */
export async function listCustomers(
  actor: Actor,
  { q, page = 1 }: { q?: string; page?: number } = {},
) {
  authorize(actor, 'customer.view')
  await ensureReady()
  const text = q?.trim().slice(0, 80)
  const where = text
    ? {
        OR: [
          { email: { contains: text.toLowerCase() } },
          { name: { contains: text } },
          { phone: { contains: text } },
        ],
      }
    : {}
  const safePage = Math.min(10_000, Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1))
  const [rows, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        emailVerifiedAt: true,
        isActive: true,
        lockedUntil: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    prisma.customer.count({ where }),
  ])
  const ids = rows.map((r) => r.id)
  const [favorites, inquiries] = await Promise.all([
    prisma.favorite.groupBy({
      by: ['customerId'],
      where: { customerId: { in: ids } },
      _count: { _all: true },
    }),
    countCustomerInquiries(ids),
  ])
  const saved = new Map(favorites.map((f) => [f.customerId, f._count._all]))
  return {
    rows: rows.map((r) => ({
      ...r,
      savedCount: saved.get(r.id) ?? 0,
      requestCount: inquiries.get(r.id) ?? 0,
    })),
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
  }
}

/** Deactivating ends every session at once; the account cannot sign in until reactivated. */
export async function setCustomerActive(actor: Actor, id: string, active: boolean) {
  authorize(actor, 'customer.manage')
  await ensureReady()
  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.customer.updateMany({ where: { id }, data: { isActive: active } })
    if (res.count !== 1) return false
    if (!active) await tx.customerSession.deleteMany({ where: { customerId: id } })
    await recordAudit(
      {
        actor,
        action: active ? 'account.reactivated' : 'account.deactivated',
        targetType: 'Customer',
        targetId: id,
      },
      tx,
    )
    return true
  })
  if (!updated) return { ok: false as const, error: 'Account not found.' }
  return { ok: true as const }
}
