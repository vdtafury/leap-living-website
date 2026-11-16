'use client'

import { preload } from 'react-dom'
import { ResponsiveImg, getPortraitImage, getResponsiveImage } from '@/components/ui/responsive-img'

/**
 * Hero backdrop image sourced from the client's official Dubai daylight footage
 * (panoramic Palm Jumeirah and waterfront architecture). Pre-optimized into
 * responsive WebP variants (640, 768, 960, 1280, 1920) and a dedicated portrait
 * crop for phones.
 */
const HERO_POSTER = '/images/hero-dubai-skyline.jpg'

/** Phones in portrait get a pre-cropped centre strip (sharper and lighter). */
const PORTRAIT_MEDIA = '(max-width: 700px) and (orientation: portrait)'
const LANDSCAPE_MEDIA = '(min-width: 701px), (orientation: landscape)'

export function HeroVideoBackdrop() {
  // Hoists high-priority <link rel="preload"> tags for the poster into <head>,
  // one per art-directed source, so each device fetches exactly one file instantly.
  const poster = getResponsiveImage(HERO_POSTER)
  const portrait = getPortraitImage(HERO_POSTER)
  preload(poster.src, {
    as: 'image',
    fetchPriority: 'high',
    imageSrcSet: poster.srcSet,
    imageSizes: '100vw',
    media: portrait ? LANDSCAPE_MEDIA : undefined,
  })
  if (portrait) {
    preload(portrait.src, {
      as: 'image',
      fetchPriority: 'high',
      imageSrcSet: `${portrait.src} ${portrait.w}w`,
      imageSizes: '100vw',
      media: PORTRAIT_MEDIA,
    })
  }

  return (
    <div className="ll-hero-backdrop" aria-hidden="true">
      {/* High-priority responsive image: the LCP element. */}
      <picture>
        {portrait && <source media={PORTRAIT_MEDIA} srcSet={portrait.src} />}
        <ResponsiveImg
          src={HERO_POSTER}
          sizes="100vw"
          priority
          alt="Panoramic Dubai Palm Jumeirah and skyline"
          className="ll-hero-poster"
        />
      </picture>

      <div className="ll-hero-scrim" />
    </div>
  )
}
