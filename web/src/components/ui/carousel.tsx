'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/icons'

export interface CarouselSlide {
  key: string
  /** Rendered on the server; the carousel only scrolls it. */
  node: ReactNode
}

interface CarouselProps {
  slides: CarouselSlide[]
  /** Accessible name of the carousel region. */
  label: string
  /** What one slide is, for the button and counter labels (e.g. "property"). */
  noun: string
  /** Plural of `noun` (e.g. "properties"). */
  nounPlural: string
  /** Left side of the section header (the section title). */
  children: ReactNode
  /** Shown on the right of the header (e.g. a "View all" link). */
  action?: ReactNode
  /** Last slide, after the counted ones (e.g. a "View all" card). Not counted. */
  endSlide?: ReactNode
  className?: string
  /** Run the track to the right edge of the screen so the next card peeks in. The section
   *  must carry `ll-carousel-bleed-host`. */
  bleed?: boolean
}

const DRAG_THRESHOLD = 6

/**
 * Horizontal card carousel (D-47, owner: "creative, understood without thinking; no round
 * buttons in the top corner"). After Netflix / Apple / the big property portals:
 * - the next card peeks in at the screen edge under a tall "N more" tab (Netflix edge);
 *   a matching tab appears on the left once scrolled;
 * - under the track, one segment per card: the cards in view light up; a click jumps there;
 * - the mouse can drag the track (touch swipes natively); ←/→ keys work inside;
 * - an optional end card ("View all") closes the row.
 * Native scroll-snap underneath; slides arrive pre-rendered, so the cards ship no JavaScript.
 */
export function Carousel({
  slides,
  label,
  noun,
  nounPlural,
  children,
  action,
  endSlide,
  className,
  bleed = false,
}: CarouselProps) {
  const count = slides.length
  const trackRef = useRef<HTMLUListElement>(null)
  const frame = useRef(0)
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [state, setState] = useState({ canPrev: false, canNext: count > 1, first: 0, last: 0 })

  /** Width of one card + gap. */
  const stepOf = (track: HTMLElement) => {
    const first = track.querySelector<HTMLElement>('li')
    return first ? first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0') : 1
  }

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    const left = track.scrollLeft
    // Cards fully inside the container (not the peeks at the screen edges)
    const box = track.getBoundingClientRect()
    const pad = getComputedStyle(track)
    const padLeft = parseFloat(pad.paddingLeft || '0')
    const padRight = parseFloat(pad.paddingRight || '0')
    const cards = [
      ...track.querySelectorAll<HTMLElement>(':scope > li:not(.ll-carousel-slide--end)'),
    ]
    let first = -1
    let last = -1
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect()
      if (r.left >= box.left + padLeft - 2 && r.right <= box.right - padRight + 2) {
        if (first < 0) first = i
        last = i
      }
    })
    if (first < 0) {
      // Narrower than one card (never on the shipped sizes): the nearest one
      first = Math.min(count - 1, Math.round(left / stepOf(track)))
      last = first
    }
    setState({ canPrev: left > 4, canNext: left < max - 4, first, last })
  }, [count])

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

  const smooth = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  const scrollToIndex = (index: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: Math.max(0, index) * stepOf(track), behavior: smooth() })
  }

  /** One "page" of cards at a time, so the tab feels like turning to the next set. */
  const page = (dir: -1 | 1) => {
    const visible = state.last - state.first + 1
    scrollToIndex(dir === 1 ? state.first + visible : state.first - visible)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollToIndex(state.first + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollToIndex(state.first - 1)
    }
  }

  // Mouse drag (touch and pen already scroll natively)
  const onPointerDown = (e: ReactPointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const track = trackRef.current
    if (!track) return
    drag.current = { x: e.clientX, left: track.scrollLeft, moved: false }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current
    const track = trackRef.current
    if (!d || !track) return
    if (!(e.buttons & 1)) {
      // Button released outside the window before a drag began
      drag.current = null
      return
    }
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) < DRAG_THRESHOLD) return
    if (!d.moved) {
      d.moved = true
      setDragging(true)
      track.setPointerCapture(e.pointerId)
      // A drag that began on text must not leave it selected
      window.getSelection()?.removeAllRanges()
    }
    track.scrollLeft = d.left - dx
  }

  const endDrag = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current
    const track = trackRef.current
    drag.current = null
    if (!d || !track || !d.moved) return
    if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId)
    // Swallow the click that follows this drag (and only that one)
    suppressClick.current = true
    window.setTimeout(() => {
      suppressClick.current = false
    }, 0)
    setDragging(false)
    // Settle on the nearest card, in the direction of the drag
    const step = stepOf(track)
    const moved = track.scrollLeft - d.left
    const target =
      moved > 0
        ? Math.ceil(track.scrollLeft / step - 0.2)
        : Math.floor(track.scrollLeft / step + 0.2)
    track.scrollTo({ left: Math.max(0, target) * step, behavior: smooth() })
  }

  const onClickCapture = (e: ReactMouseEvent) => {
    if (!suppressClick.current) return
    suppressClick.current = false
    e.preventDefault()
    e.stopPropagation()
  }

  const remaining = count - 1 - state.last
  const before = state.first

  return (
    <div
      className={['ll-carousel', bleed && 'll-carousel--bleed', className]
        .filter(Boolean)
        .join(' ')}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      <div className="ll-section-header ll-carousel-head">
        <div>{children}</div>
        {action && <div className="ll-carousel-actions">{action}</div>}
      </div>

      <div className="ll-carousel-stage">
        <ul
          ref={trackRef}
          className="ll-carousel-track"
          data-dragging={dragging}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
        >
          {slides.map((slide, i) => (
            <li
              key={slide.key}
              className="ll-carousel-slide"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              {slide.node}
            </li>
          ))}
          {endSlide && <li className="ll-carousel-slide ll-carousel-slide--end">{endSlide}</li>}
        </ul>

        <button
          type="button"
          className="ll-carousel-edge ll-carousel-edge--prev"
          data-show={state.canPrev}
          tabIndex={state.canPrev ? 0 : -1}
          aria-hidden={!state.canPrev}
          onClick={() => page(-1)}
          aria-label={`Previous ${nounPlural}`}
        >
          <span className="ll-carousel-tab">
            <ArrowLeftIcon size={20} />
            {before > 0 && <span className="ll-carousel-tab-text tabular-nums">{before} back</span>}
          </span>
        </button>
        <button
          type="button"
          className="ll-carousel-edge ll-carousel-edge--next"
          data-show={state.canNext}
          tabIndex={state.canNext ? 0 : -1}
          aria-hidden={!state.canNext}
          onClick={() => page(1)}
          aria-label={
            remaining > 0
              ? `Next ${remaining === 1 ? noun : nounPlural}, ${remaining} more`
              : 'See all'
          }
        >
          <span className="ll-carousel-tab">
            <ArrowRightIcon size={20} />
            <span className="ll-carousel-tab-text tabular-nums">
              {remaining > 0 ? `${remaining} more` : 'View all'}
            </span>
          </span>
        </button>
      </div>

      <div className="ll-carousel-foot">
        <div className="ll-carousel-segments" role="group" aria-label={`Go to a ${noun}`}>
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              className="ll-carousel-seg"
              data-on={i >= state.first && i <= state.last}
              aria-label={`Show ${noun} ${i + 1} of ${count}`}
              aria-current={i >= state.first && i <= state.last ? 'true' : undefined}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
        <span className="ll-carousel-count tabular-nums" aria-live="polite">
          <span className="sr-only">Showing {nounPlural} </span>
          {state.first + 1}
          {state.last > state.first && <>–{state.last + 1}</>}
          <span className="ll-carousel-count-total"> of {count}</span>
        </span>
      </div>
    </div>
  )
}
