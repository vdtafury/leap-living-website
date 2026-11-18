import { afterEach, describe, expect, it, vi } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment()
})

import { PROJECTS, PROPERTIES } from '@/data/catalog'

async function load(env: Record<string, string | undefined>) {
  vi.resetModules()
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value as string)
  const robots = (await import('./robots')).default
  const sitemap = (await import('./sitemap')).default
  return { robots: robots(), sitemap: await sitemap() }
}

afterEach(() => vi.unstubAllEnvs())

describe('robots.txt and sitemap.xml', () => {
  it('keeps crawlers out unless SITE_INDEXING=true (staging is safe by default)', async () => {
    const { robots } = await load({ SITE_INDEXING: undefined })
    expect(robots.rules).toEqual({ userAgent: '*', disallow: '/' })
    expect(robots.sitemap).toBeUndefined()
  })

  it('opens the live site and points to the sitemap', async () => {
    const { robots } = await load({ SITE_INDEXING: 'true', SITE_URL: 'https://leapliving.ae/' })
    expect(robots.rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/media/', '/admin', '/account'],
    })
    expect(robots.sitemap).toBe('https://leapliving.ae/sitemap.xml')
  })

  it('lists every page, property and project once, on the configured origin', async () => {
    const { sitemap } = await load({ SITE_URL: 'https://staging.leapliving.ae' })
    const urls = sitemap.map((entry) => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls.every((u) => u.startsWith('https://staging.leapliving.ae/'))).toBe(true)
    for (const p of PROPERTIES)
      expect(urls).toContain(`https://staging.leapliving.ae/properties/${p.slug}`)
    for (const p of PROJECTS)
      expect(urls).toContain(`https://staging.leapliving.ae/projects/${p.slug}`)
    expect(urls).toContain('https://staging.leapliving.ae/contact')
  })

  it('leaves out drafts, archived and deleted listings', async () => {
    const { prisma } = await import('@/server/db')
    await prisma.property.update({
      where: { slug: PROPERTIES[0].slug },
      data: { publicationStatus: 'DRAFT' },
    })
    await prisma.project.update({
      where: { slug: PROJECTS[0].slug },
      data: { deletedAt: new Date() },
    })
    const { sitemap } = await load({ SITE_URL: 'https://leapliving.ae' })
    const urls = sitemap.map((entry) => entry.url)
    expect(urls).not.toContain(`https://leapliving.ae/properties/${PROPERTIES[0].slug}`)
    expect(urls).not.toContain(`https://leapliving.ae/projects/${PROJECTS[0].slug}`)
    expect(urls).toContain(`https://leapliving.ae/properties/${PROPERTIES[1].slug}`)
  })
})
