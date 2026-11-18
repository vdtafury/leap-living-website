import type { prisma } from '@/server/db'
import { PROJECTS, PROPERTIES } from '@/data/catalog'
import { propertyFromCatalog } from '../domain/property'
import { projectFromCatalog } from '../domain/project'

type Db = Pick<typeof prisma, 'property' | 'project'>

/** Starter listings and projects (catalog.ts), published, in their current order. */
export async function seedListings(db: Db): Promise<{ properties: number; projects: number }> {
  let properties = 0
  let projects = 0
  for (const [index, item] of PROPERTIES.entries()) {
    if (await db.property.findUnique({ where: { slug: item.slug } })) continue
    await db.property.create({ data: propertyFromCatalog(item, (index + 1) * 10) })
    properties++
  }
  for (const [index, item] of PROJECTS.entries()) {
    if (await db.project.findUnique({ where: { slug: item.slug } })) continue
    await db.project.create({ data: projectFromCatalog(item, (index + 1) * 10) })
    projects++
  }
  return { properties, projects }
}
