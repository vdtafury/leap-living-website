import type { prisma } from '@/server/db'
import { DEVELOPER_BRANDS } from '@/data/catalog'

/** Starter developer strip (catalog.ts), in the client sheet order. */
export async function seedDevelopers(db: Pick<typeof prisma, 'developer'>): Promise<number> {
  let created = 0
  for (const [index, brand] of DEVELOPER_BRANDS.entries()) {
    if (await db.developer.findUnique({ where: { name: brand.name } })) continue
    await db.developer.create({
      data: {
        name: brand.name,
        logoUrl: brand.logo ?? '',
        logoWidth: brand.width,
        logoHeight: brand.height,
        sortOrder: (index + 1) * 10,
      },
    })
    created++
  }
  return created
}
