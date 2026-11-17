import type { Metadata } from 'next'
import { SITE } from '@/data/site'

/**
 * Build-time site settings (the cPanel zip is built per environment):
 *   SITE_URL       public origin, default https://leapliving.ae (staging: https://staging.leapliving.ae)
 *   SITE_INDEXING  "true" only for the live production site. Anything else (default) keeps search
 *                  engines out: robots.txt disallows all, every page carries noindex, and every
 *                  response sends X-Robots-Tag (see next.config.ts).
 */
export const SITE_URL = (process.env.SITE_URL || 'https://leapliving.ae').replace(/\/+$/, '')
export const SITE_INDEXING = process.env.SITE_INDEXING === 'true'

export const OG_IMAGE = {
  url: '/brand/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'LEAP LIVING Real Estate Consultancy, Dubai',
}

/**
 * Per-page metadata with matching Open Graph / Twitter cards (link previews on WhatsApp,
 * LinkedIn, X) and a canonical URL. `path` is the page path, e.g. '/buy'.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): Metadata {
  // One light JPEG for every page: WhatsApp skips preview images much over ~300 KB, and the
  // listing photos are far heavier.
  const images = [OG_IMAGE]
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: 'en_AE',
      url: path,
      title,
      description,
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url) },
  }
}
