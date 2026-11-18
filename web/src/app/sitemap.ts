import type { MetadataRoute } from 'next'
import { listPublishedProjects, listPublishedProperties } from '@/modules/listings'
import { SITE_URL } from '@/lib/seo'

// Read on every request: new listings appear without a rebuild, and the build never touches a DB.
export const dynamic = 'force-dynamic'

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/buy', priority: 0.9 },
  { path: '/rent', priority: 0.9 },
  { path: '/projects', priority: 0.8 },
  { path: '/sell', priority: 0.8 },
  { path: '/about', priority: 0.7 },
  { path: '/contact', priority: 0.7 },
]

/** Published, non-deleted listings and projects only. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, projects] = await Promise.all([
    listPublishedProperties(),
    listPublishedProjects(),
  ])
  return [
    ...STATIC_ROUTES.map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, priority })),
    ...properties.map((p) => ({ url: `${SITE_URL}/properties/${p.slug}`, priority: 0.6 })),
    ...projects.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, priority: 0.6 })),
  ]
}
