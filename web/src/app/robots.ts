import type { MetadataRoute } from 'next'
import { SITE_INDEXING, SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXING) {
    // Staging / previews: keep every crawler out.
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/media/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
