import type { Metadata } from 'next'
import { SITE } from '@/data/site'
import manifest from '@/data/image-manifest.json'

type ManifestEntry = {
  width: number
  height: number
  variants: { w: number; src: string }[]
}
const IMAGES = manifest as Record<string, ManifestEntry>

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

function resolveOgImage(image: { url: string; alt?: string }): {
  url: string
  width?: number
  height?: number
  alt: string
} {
  const entry = IMAGES[image.url]
  if (entry && entry.variants.length > 0) {
    // Prefer a ~960–1280px WebP variant (fast to fetch, well under WhatsApp's ~300 KB cap).
    const picked =
      entry.variants.find((v) => v.w >= 960 && v.w <= 1280) ??
      entry.variants[entry.variants.length - 1]
    const height = Math.round((picked.w / entry.width) * entry.height)
    return { url: picked.src, width: picked.w, height, alt: image.alt ?? OG_IMAGE.alt }
  }
  return { url: image.url, alt: image.alt ?? OG_IMAGE.alt }
}

/**
 * Per-page metadata with matching Open Graph / Twitter cards (link previews on WhatsApp,
 * LinkedIn, X) and a canonical URL. `path` is the page path, e.g. '/buy'.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string
  description: string
  path: string
  image?: { url: string; alt?: string }
}): Metadata {
  const images = image?.url ? [resolveOgImage(image), OG_IMAGE] : [OG_IMAGE]
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
