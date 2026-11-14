'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

interface HeroClip {
  src: string
  poster: string
}

const HERO_CLIPS: HeroClip[] = [
  {
    src: '/videos/beach-turquoise-ocean.mp4',
    poster: '/images/hero-dubai-beach-daylight.jpg',
  },
  {
    src: '/videos/dubai-palm-jumeirah-sunny.mp4',
    poster: '/images/hero-palm-villas.jpg',
  },
  {
    src: '/videos/beach-aerial-pier.mp4',
    poster: '/images/hero-dubai-beach-daylight.jpg',
  },
  {
    src: '/videos/luxury-villa-pool-sunny.mp4',
    poster: '/images/waterfront-pool-estate.jpg',
  },
  {
    src: '/videos/luxury-yacht-waterfront.mp4',
    poster: '/images/hero-marina-daylight.jpg',
  },
  {
    src: '/videos/coastal-yacht-bay.mp4',
    poster: '/images/hero-palm-villas.jpg',
  },
]

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
