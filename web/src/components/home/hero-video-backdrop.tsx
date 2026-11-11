'use client'

import { useEffect, useRef, useState } from 'react'

interface HeroClip {
  src: string
  poster: string
}

const HERO_CLIPS: HeroClip[] = [
  {
    src: '/videos/dubai-downtown-aerial.mp4',
    poster: '/images/hero-dubai-skyline.jpg',
  },
  {
    src: '/videos/dubai-palm-jumeirah.mp4',
    poster: '/images/hero-dubai-skyline.jpg',
  },
  {
    src: '/videos/luxury-villa-pool.mp4',
    poster: '/images/property-palm-villa.jpg',
  },
  {
    src: '/videos/modern-residence-interior.mp4',
    poster: '/images/property-sky-penthouse.jpg',
  },
  {
    src: '/videos/dubai-marina-skyline.mp4',
    poster: '/images/dubai-marina-commercial.jpg',
  },
]

const CLIP_DURATION_MS = 9000

export function HeroVideoBackdrop() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [readyClips, setReadyClips] = useState<Record<number, boolean>>({})
  const [reducedMotion, setReducedMotion] = useState(false)
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)

    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const advanceTo = (nextIdx: number) => {
    setActiveIndex((current) => {
      if (current === nextIdx) return current
      setPreviousIndex(current)
      return nextIdx
    })
  }

  useEffect(() => {
    if (reducedMotion) return

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
  }, [activeIndex, reducedMotion])

  const nextIndex = (activeIndex + 1) % HERO_CLIPS.length

  return (
    <div className="ll-hero-backdrop" aria-hidden="true">
      {/* Persistent high-resolution poster fallback prevents flashes or layout shifts */}
      <img
        src="/images/hero-dubai-skyline.jpg"
        alt="Panoramic Dubai skyline featuring Burj Khalifa"
        className="ll-hero-poster"
      />

      {!reducedMotion &&
        HERO_CLIPS.map((clip, idx) => {
          const isActive = idx === activeIndex
          const isPrevious = idx === previousIndex
          const isNext = idx === nextIndex
          if (!isActive && !isPrevious && !isNext) return null

          const isReady = Boolean(readyClips[idx])
          const isVisible = isActive ? isReady : isPrevious && !readyClips[activeIndex]

          return (
            <video
              key={clip.src}
              ref={(el) => {
                videoRefs.current[idx] = el
              }}
              src={clip.src}
              poster={clip.poster}
              autoPlay={isActive}
              muted
              loop={false}
              playsInline
              preload={isActive ? 'auto' : 'metadata'}
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
