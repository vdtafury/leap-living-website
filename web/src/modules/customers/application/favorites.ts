import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { listPublishedProjectsByIds, listPublishedPropertiesByIds } from '@/modules/listings'
import { favoriteKey, MAX_FAVORITES, parseFavoriteKey, type FavoriteType } from '../domain/account'

/** The account's saved items as `TYPE:id` keys (for the hearts across the site). */
export async function listFavoriteKeys(customerId: string): Promise<string[]> {
  const rows = await prisma.favorite.findMany({
    where: { customerId },
    select: { itemType: true, itemId: true },
    orderBy: { createdAt: 'desc' },
    take: MAX_FAVORITES,
  })
  return rows.map((r) => favoriteKey(r.itemType as FavoriteType, r.itemId))
}

async function isPublished(type: FavoriteType, id: string) {
  const items =
    type === 'PROPERTY'
      ? await listPublishedPropertiesByIds([id])
      : await listPublishedProjectsByIds([id])
  return items.length === 1
}

/**
 * Saves or removes one item. Only published items can be saved (an id guessed from outside
 * cannot store a draft); removing always works, even after the item was unpublished.
 */
export async function setFavorite(
  customerId: string,
  key: unknown,
  saved: boolean,
): Promise<{ ok: true; saved: boolean } | { ok: false; error: string }> {
  await ensureReady()
  const item = parseFavoriteKey(key)
  if (!item) return { ok: false, error: 'Unknown item.' }
  const where = { customerId, itemType: item.type, itemId: item.id }

  if (!saved) {
    await prisma.favorite.deleteMany({ where })
    return { ok: true, saved: false }
  }
  if (!(await isPublished(item.type, item.id))) {
    return { ok: false, error: 'This listing is no longer available.' }
  }
  const existing = await prisma.favorite.findUnique({
    where: { customerId_itemType_itemId: where },
  })
  if (existing) return { ok: true, saved: true }
  if ((await prisma.favorite.count({ where: { customerId } })) >= MAX_FAVORITES) {
    return { ok: false, error: `You can save up to ${MAX_FAVORITES} items. Remove some first.` }
  }
  await prisma.favorite.upsert({
    where: { customerId_itemType_itemId: where },
    create: where,
    update: {},
  })
  return { ok: true, saved: true }
}

/**
 * Saved items for the account page, newest first. Items that were unpublished or deleted are
 * not shown (they stay saved and come back if republished); `unavailable` counts them.
 */
export async function listFavoriteItems(customerId: string) {
  await ensureReady()
  const rows = await prisma.favorite.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: MAX_FAVORITES,
  })
  const ids = (type: FavoriteType) => rows.filter((r) => r.itemType === type).map((r) => r.itemId)
  const [properties, projects] = await Promise.all([
    listPublishedPropertiesByIds(ids('PROPERTY')),
    listPublishedProjectsByIds(ids('PROJECT')),
  ])
  const order = new Map(rows.map((r, index) => [`${r.itemType}:${r.itemId}`, index]))
  const rank = (type: FavoriteType, id?: string) => order.get(`${type}:${id}`) ?? 0
  properties.sort((a, b) => rank('PROPERTY', a.id) - rank('PROPERTY', b.id))
  projects.sort((a, b) => rank('PROJECT', a.id) - rank('PROJECT', b.id))
  return {
    properties,
    projects,
    unavailable: rows.length - properties.length - projects.length,
  }
}
