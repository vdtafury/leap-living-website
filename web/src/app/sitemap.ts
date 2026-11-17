import type { MetadataRoute } from 'next'
import { PROJECTS, PROPERTIES } from '@/data/catalog'
import { SITE_URL } from '@/lib/seo'

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/buy', priority: 0.9 },
  { path: '/rent', priority: 0.9 },
  { path: '/projects', priority: 0.8 },
  { path: '/sell', priority: 0.8 },
  { path: '/mortgage', priority: 0.6 },
  { path: '/about', priority: 0.7 },
  { path: '/contact', priority: 0.7 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_ROUTES.map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, priority })),
    ...PROPERTIES.map((p) => ({ url: `${SITE_URL}/properties/${p.slug}`, priority: 0.6 })),
    ...PROJECTS.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, priority: 0.6 })),
  ]
}
