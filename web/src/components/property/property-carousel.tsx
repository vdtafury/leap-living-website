'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { PropertyListing } from '@/data/catalog'
import { PropertyCard } from '@/components/property/property-card'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/icons'

interface PropertyCarouselProps {
  items: PropertyListing[]
  /** Accessible name of the carousel region. */
  label: string
  /** Left side of the section header (eyebrow, title, lead). */
  children: ReactNode
  /** Extra action shown next to the arrows (e.g. "View all" link). */
  action?: ReactNode
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Horizontal property carousel: native scroll-snap track (swipe / trackpad),
 * prev / next arrows that move one card, keyboard arrows, counter + progress.
 */
export function PropertyCarousel({ items, label, children, action }: PropertyCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const frame = useRef(0)
  const [state, setState] = useState({
    canPrev: false,
    canNext: items.length > 1,
    index: 0,
    progress: 0,
    thumb: 1,
  })

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    const first = track.querySelector<HTMLElement>('li')
    const step = first
      ? first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0')
      : 1
    const left = track.scrollLeft
    setState({
      canPrev: left > 4,
      canNext: left < max - 4,
      index: Math.min(items.length - 1, Math.round(left / step)),
      progress: max > 0 ? left / max : 0,
      thumb: track.scrollWidth > 0 ? Math.min(1, track.clientWidth / track.scrollWidth) : 1,
    })
  }, [items.length])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    measure()
    const onScroll = () => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(measure)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    return () => {
      track.removeEventListener('scroll', onScroll)
      ro.disconnect()
      cancelAnimationFrame(frame.current)
    }
  }, [measure])

  const go = (dir: -1 | 1) => {
    const track = trackRef.current
    const first = track?.querySelector<HTMLElement>('li')
    if (!track || !first) return
    const step = first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
  }

  const visibleCount = Math.max(1, Math.round(state.thumb * items.length))
  const lastVisible = Math.min(items.length, state.index + visibleCount)

  return (
    <div
      className="ll-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      <div className="ll-section-header ll-carousel-head">
        <div>{children}</div>
        <div className="ll-carousel-actions">
          {action}
          <div className="ll-carousel-nav">
            <span className="ll-carousel-count tabular-nums" aria-live="polite">
              <span className="sr-only">Showing properties </span>
              {pad(state.index + 1)}
              {visibleCount > 1 && <>–{pad(lastVisible)}</>}
              <span className="ll-carousel-count-total"> / {pad(items.length)}</span>
            </span>
            <button
              type="button"
              className="ll-carousel-btn"
              onClick={() => go(-1)}
              disabled={!state.canPrev}
              aria-label="Previous property"
            >
              <ArrowLeftIcon size={18} />
            </button>
            <button
              type="button"
              className="ll-carousel-btn"
              onClick={() => go(1)}
              disabled={!state.canNext}
              aria-label="Next property"
            >
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <ul ref={trackRef} className="ll-carousel-track">
        {items.map((property, i) => (
          <li
            key={property.slug}
            className="ll-carousel-slide"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
          >
            <PropertyCard property={property} />
          </li>
        ))}
      </ul>

      <div className="ll-carousel-progress" aria-hidden="true">
        <span
          className="ll-carousel-progress-thumb"
          style={{
            width: `${state.thumb * 100}%`,
            transform: `translateX(${(state.progress * (1 - state.thumb) * 100) / state.thumb}%)`,
          }}
        />
      </div>
    </div>
  )
}
