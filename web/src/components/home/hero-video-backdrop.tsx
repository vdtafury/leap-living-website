'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { preload } from 'react-dom'
import { ResponsiveImg, getPortraitImage, getResponsiveImage } from '@/components/ui/responsive-img'
import { HERO_VIDEO_SRC, shouldPlayHeroVideo } from '@/lib/hero-video'

/**
 * Official client hero reel (Dubai & Palm Jumeirah aerials, 74 s loop), played from the client's
 * original file exactly as delivered (see `@/lib/hero-video`).
 *
 * Seamless start: the poster IS frame 0 of that file (scripts/prepare-hero-original.sh cuts it,
 * landscape and phone crop), both layers share the same object-fit/position, and the video is
 * switched on, with no fade, only once it has presented its first frame. So the still simply
 * starts moving. With no video (file missing, Save-Data, slow link, reduced motion, playback
 * error) the poster stays: the same picture, in full quality.
 */
const HERO_POSTER = '/images/client-video-frame-0.jpg'
const PORTRAIT_MEDIA = '(max-width: 700px) and (orientation: portrait)'
const LANDSCAPE_MEDIA = '(min-width: 701px), (orientation: landscape)'

interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: string
  /** Mbps estimate; Chrome caps it at 10. Not available in Safari / Firefox. */
  downlink?: number
}

function canPlayHere(hasVideo: boolean): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
  return shouldPlayHeroVideo({
    hasVideo,
    saveData: connection?.saveData,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    hostname: window.location.hostname,
  })
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches
const getReducedMotionOnServer = () => false

export function HeroVideoBackdrop({ hasVideo = false }: { hasVideo?: boolean }) {
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionOnServer,
  )
  // Decided once the poster is painted; false = the poster stays.
  const [playVideo, setPlayVideo] = useState(false)

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

  // The video starts only after the poster has loaded and decoded: otherwise, on slow links,
  // the video download competes with the poster and the hero shows the bare teal background
  // until the video pops in. Order is always: poster (frame 0) → video (frame 0 → motion).
  useEffect(() => {
    if (reducedMotion) return
    let cancelled = false
    let rafId: number | undefined
    const start = () => {
      if (cancelled) return
      rafId = requestAnimationFrame(() => setPlayVideo(canPlayHere(hasVideo)))
    }
    const img = backdropRef.current?.querySelector<HTMLImageElement>('img.ll-hero-poster')
    if (img) img.decode().then(start, start)
    else start()
    return () => {
      cancelled = true
      if (rafId !== undefined) cancelAnimationFrame(rafId)
    }
  }, [reducedMotion, hasVideo])

  useEffect(() => {
    if (reducedMotion || !playVideo) return
    const v = videoRef.current
    if (!v) return
    let cancelled = false
    let frameHandle: number | undefined
    const play = () => {
      const p = v.play()
      if (p) {
        p.catch(() => {
          // Autoplay blocked: the paused frame 0 / poster (the same picture) simply stays.
        })
      }
    }
    const reveal = () => {
      if (cancelled) return
      // Straight on the element, in the same frame callback: waiting for a React render
      // would let the video run a frame or two past the poster before it shows.
      v.classList.add('is-visible')
      setVideoReady(true)
    }
    // Shown only once the browser has painted a frame — never on `canplay`, which fires before
    // anything is drawn. If decoding started late and the first painted frame is already past
    // frame 0, rewind (still hidden) so the first visible frame is exactly the poster.
    const onFirstFrame = (mediaTime: number) => {
      if (cancelled) return
      if (mediaTime < 0.05) return reveal()
      v.pause()
      v.addEventListener(
        'seeked',
        () => {
          reveal()
          requestAnimationFrame(() => {
            if (!cancelled) play()
          })
        },
        { once: true },
      )
      v.currentTime = 0
    }

    // requestVideoFrameCallback: Chrome/Edge, Safari 15.4+, Firefox 132+.
    if (typeof v.requestVideoFrameCallback === 'function') {
      frameHandle = v.requestVideoFrameCallback((_now, meta) => onFirstFrame(meta.mediaTime))
    } else {
      v.addEventListener('playing', () => onFirstFrame(v.currentTime), { once: true })
    }

    // play() (not only the autoPlay attribute) so iOS starts fetching data.
    play()
    return () => {
      cancelled = true
      if (frameHandle !== undefined) v.cancelVideoFrameCallback(frameHandle)
    }
  }, [reducedMotion, playVideo])

  return (
    <div ref={backdropRef} className="ll-hero-backdrop" aria-hidden="true">
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
      {!reducedMotion && playVideo && (
        <video
          ref={videoRef}
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          // File missing on this server, or not playable: the poster (same picture) stays.
          onError={() => setPlayVideo(false)}
          className={`ll-hero-video ${videoReady ? 'is-visible' : ''}`}
        />
      )}

      <div className="ll-hero-scrim" />
    </div>
  )
}
