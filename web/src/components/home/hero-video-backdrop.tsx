'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { preload } from 'react-dom'
import { ResponsiveImg, getPortraitImage, getResponsiveImage } from '@/components/ui/responsive-img'

/**
 * Official client hero reel provided by the client (1080p aerial footage of Dubai & Palm Jumeirah).
 * Re-encoded into two lightweight web renditions (+faststart, silent ambient loop):
 *   /videos/hero/client-hero-1280.mp4 (desktop / large screens, ~19MB)
 *   /videos/hero/client-hero-854.mp4  (mobile / phones, ~7.2MB)
 */
type Rendition = '1280' | '854'

const HERO_POSTER = '/images/hero-dubai-skyline.jpg'
const PORTRAIT_MEDIA = '(max-width: 700px) and (orientation: portrait)'
const LANDSCAPE_MEDIA = '(min-width: 701px), (orientation: landscape)'

interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: string
}

/**
 * Decides whether — and at what size — the background video may load.
 * Returns null when video should be skipped entirely (Save-Data, 2G).
 */
function pickRendition(): Rendition | null {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
  if (connection?.saveData) return null
  if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) return null
  const lite = window.matchMedia('(max-width: 900px)').matches || connection?.effectiveType === '3g'
  return lite ? '854' : '1280'
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches
const getReducedMotionOnServer = () => false

export function HeroVideoBackdrop() {
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionOnServer,
  )
  // Video stays off until the page has fully loaded and the browser is idle,
  // so the poster (the LCP element) never competes with video bandwidth.
  const [rendition, setRendition] = useState<Rendition | null>(null)

  // Hoists high-priority <link rel="preload"> tags for the poster into <head>,
  // one per art-directed source, so each device fetches exactly one file.
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

  useEffect(() => {
    if (reducedMotion) return
    let idleId: number | undefined
    let timeoutId: number | undefined

    const enable = () => setRendition(pickRendition())
    const schedule = () => {
      // Safari has no requestIdleCallback; fall back to a short timeout.
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(enable, { timeout: 2500 })
      } else {
        timeoutId = setTimeout(enable, 600) as unknown as number
      }
    }

    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })

    return () => {
      window.removeEventListener('load', schedule)
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion || !rendition) return
    const v = videoRef.current
    if (v) {
      const p = v.play()
      if (p) {
        p.catch(() => {
          // Poster fallback remains visible if autoplay is restricted
        })
      }
    }
  }, [reducedMotion, rendition])

  const videoSrc = rendition ? `/videos/hero/client-hero-${rendition}.mp4` : null

  return (
    <div className="ll-hero-backdrop" aria-hidden="true">
      {/* Persistent poster: the LCP element. Responsive WebP, fetched first. */}
      <picture>
        {portrait && <source media={PORTRAIT_MEDIA} srcSet={portrait.src} />}
        <ResponsiveImg
          src={HERO_POSTER}
          sizes="100vw"
          priority
          alt="Panoramic Dubai skyline featuring Palm Jumeirah"
          className="ll-hero-poster"
        />
      </picture>

      {/* Official client hero video reel: loops continuously */}
      {!reducedMotion && videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          className={`ll-hero-video ${videoReady ? 'is-visible' : ''}`}
        />
      )}

      <div className="ll-hero-scrim" />
    </div>
  )
}
