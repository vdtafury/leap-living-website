'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { preload } from 'react-dom'
import { ResponsiveImg, getPortraitImage, getResponsiveImage } from '@/components/ui/responsive-img'

/**
 * Hero clips, re-encoded by `scripts/encode-hero-videos.sh` into two silent,
 * 9.6s, faststart H.264 renditions each:
 *   /videos/hero/<name>-1280.mp4  (desktop, ~0.9–2MB)
 *   /videos/hero/<name>-854.mp4   (phones / slow links, ~0.25–0.8MB)
 * The originals in /videos stay as masters.
 */
const HERO_CLIPS = [
  'beach-turquoise-ocean',
  'dubai-palm-jumeirah-sunny',
  'beach-aerial-pier',
  'luxury-villa-pool-sunny',
  'luxury-yacht-waterfront',
  'coastal-yacht-bay',
]

type Rendition = '1280' | '854'

const clipSrc = (name: string, rendition: Rendition) => `/videos/hero/${name}-${rendition}.mp4`

const HERO_POSTER = '/images/hero-dubai-skyline.jpg'
/** Phones in portrait get a pre-cropped centre strip (sharper and lighter). */
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

const CLIP_DURATION_MS = 9000
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches
const getReducedMotionOnServer = () => false

export function HeroVideoBackdrop() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [readyClips, setReadyClips] = useState<Record<number, boolean>>({})
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionOnServer,
  )
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])
  // Video stays off until the page has fully loaded and the browser is idle,
  // so the poster (the LCP element) never competes with megabytes of video.
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

  const advanceTo = (nextIdx: number) => {
    setActiveIndex((current) => {
      if (current === nextIdx) return current
      setPreviousIndex(current)
      return nextIdx
    })
  }

  useEffect(() => {
    if (reducedMotion || !rendition) return

    const activeVideo = videoRefs.current[activeIndex]
    if (activeVideo) {
      activeVideo.currentTime = 0
      const p = activeVideo.play()
      if (p) {
        p.catch(() => {
          // Poster fallback remains visible if autoplay is restricted
        })
      }
    }

    const timer = window.setInterval(() => {
      advanceTo((activeIndex + 1) % HERO_CLIPS.length)
    }, CLIP_DURATION_MS)

    return () => window.clearInterval(timer)
  }, [activeIndex, reducedMotion, rendition])

  const nextIndex = (activeIndex + 1) % HERO_CLIPS.length

  return (
    <div className="ll-hero-backdrop" aria-hidden="true">
      {/* Persistent poster: the LCP element. Responsive WebP, fetched first. */}
      <picture>
        {portrait && <source media={PORTRAIT_MEDIA} srcSet={portrait.src} />}
        <ResponsiveImg
          src={HERO_POSTER}
          sizes="100vw"
          priority
          alt="Panoramic Dubai skyline featuring Burj Khalifa"
          className="ll-hero-poster"
        />
      </picture>

      {!reducedMotion &&
        rendition &&
        HERO_CLIPS.map((name, idx) => {
          const isActive = idx === activeIndex
          const isPrevious = idx === previousIndex
          const isNext = idx === nextIndex
          if (!isActive && !isPrevious && !isNext) return null

          const isReady = Boolean(readyClips[idx])
          const isVisible = isActive ? isReady : isPrevious && !readyClips[activeIndex]

          return (
            // No `poster` attribute: a clip only becomes visible once it can
            // play, so per-clip posters were never seen — just downloaded.
            <video
              key={name}
              ref={(el) => {
                videoRefs.current[idx] = el
              }}
              src={clipSrc(name, rendition)}
              autoPlay={isActive}
              muted
              loop={false}
              playsInline
              preload={isActive || (isNext && rendition === '1280') ? 'auto' : 'metadata'}
              onCanPlay={() => {
                setReadyClips((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }))
              }}
              onEnded={() => {
                if (isActive) {
                  advanceTo((idx + 1) % HERO_CLIPS.length)
                }
              }}
              className={`ll-hero-video ${isVisible ? 'is-visible' : ''}`}
              style={{ zIndex: isActive ? 2 : 1 }}
            />
          )
        })}

      <div className="ll-hero-scrim" />
    </div>
  )
}
