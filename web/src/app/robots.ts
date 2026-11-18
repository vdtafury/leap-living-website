import type { MetadataRoute } from 'next'
import { SITE_INDEXING, SITE_URL } from '@/lib/seo'

// Read on every request: SITE_INDEXING is a runtime setting on the host, not a build-time one.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXING) {
    // Staging / previews: keep every crawler out.
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/media/', '/admin', '/account'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
