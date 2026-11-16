'use client'

import { useRef, useState, useSyncExternalStore } from 'react'

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

  return (
    <div className="ll-hero-backdrop" aria-hidden="true">
      {/* Official client video reel: streams immediately with zero external skyline/building images */}
      {!reducedMotion && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          className={`ll-hero-video ${videoReady ? 'is-visible' : ''}`}
        >
          <source media="(min-width: 768px)" src="/videos/hero/client-hero-1280.mp4" type="video/mp4" />
          <source src="/videos/hero/client-hero-854.mp4" type="video/mp4" />
        </video>
      )}

      <div className="ll-hero-scrim" />
    </div>
  )
}
