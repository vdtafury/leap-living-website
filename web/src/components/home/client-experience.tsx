'use client'

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import Link from 'next/link'
import { CLIENT_PERSPECTIVES } from '@/data/catalog'
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from '@/components/ui/icons'
import { KeyholeMark } from '@/components/ui/keyhole-mark'
import { ResponsiveImg } from '@/components/ui/responsive-img'

const pad = (n: number) => String(n).padStart(2, '0')
const SWIPE_PX = 40

interface ClientExperienceProps {
  /** Number shown in the eyebrow, e.g. "05". */
  index?: string
}

/**
 * Homepage "Client Perspectives" section.
 * Uses the former Executive Leadership design (glass panel over architecture
 * photography, brand emblem card on the left) and shows one large testimonial
 * at a time on the right, with prev/next arrows, dots, ←/→ keys and swipe.
 * All quotes share one grid cell, so the panel keeps the height of the longest
 * quote and never jumps when the quote changes. No autoplay (WCAG 2.2.2).
 */
export function ClientExperience({ index = '05' }: ClientExperienceProps) {
  const items = CLIENT_PERSPECTIVES
  const [active, setActive] = useState(0)
  const pointerStart = useRef<number | null>(null)

  const go = (delta: number) => setActive((i) => (i + delta + items.length) % items.length)

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    }
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') pointerStart.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return
    const dx = e.clientX - pointerStart.current
    pointerStart.current = null
    if (Math.abs(dx) >= SWIPE_PX) go(dx < 0 ? 1 : -1)
  }

  return (
    <section className="ll-section-image ll-defer-render" aria-labelledby="ll-cx-title">
      <div className="ll-section-image-bg" aria-hidden="true">
        <ResponsiveImg src="/images/architecture-glass-towers.jpg" sizes="100vw" />
        <span className="ll-section-image-scrim" />
      </div>

      <div className="ll-container">
        <div className="ll-leadership-glass ll-cx-glass">
          <div className="ll-leadership-emblem-card">
            <KeyholeMark className="ll-keyhole ll-keyhole-emblem" strokeWidth={1.8} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-horizontal-white.png"
              alt="LEAP LIVING"
              className="ll-leadership-emblem-logo"
            />
            <div>
              <div className="ll-leadership-emblem-kicker">Client Perspectives</div>
              <h2 id="ll-cx-title" className="ll-serif-title ll-leadership-emblem-title">
                Private Client Experience
              </h2>
            </div>
            <div className="ll-leadership-emblem-foot">
              <span>Dubai · UAE</span>
              <span>Since 2005</span>
            </div>
          </div>

          <div
            className="ll-cx"
            role="group"
            aria-roledescription="carousel"
            aria-label="Client testimonials"
            onKeyDown={onKeyDown}
          >
            <div className="ll-eyebrow">
              <span className="ll-eyebrow-num">{index}</span>Client Perspectives
            </div>

            <div className="ll-cx-slides" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
              {items.map((item, i) => (
                <figure
                  key={item.author}
                  className={`ll-cx-slide${i === active ? ' is-active' : ''}`}
                  aria-hidden={i !== active}
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${items.length}`}
                >
                  <blockquote className="ll-leadership-quote">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="ll-leadership-meta">
                    <span className="ll-monogram" aria-hidden="true">
                      {item.initials}
                    </span>
                    <span className="ll-leadership-name">{item.author}</span>
                    <span className="ll-leadership-title">{item.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            {/* Announces the change for screen readers without re-reading the controls. */}
            <p className="sr-only" aria-live="polite">
              Testimonial {active + 1} of {items.length}: {items[active].author}
            </p>

            <div className="ll-cx-controls">
              <div className="ll-cx-nav">
                <button
                  type="button"
                  className="ll-carousel-btn ll-cx-btn"
                  onClick={() => go(-1)}
                  aria-label="Previous testimonial"
                >
                  <ArrowLeftIcon size={18} />
                </button>
                <span className="ll-cx-count tabular-nums" aria-hidden="true">
                  {pad(active + 1)}
                  <span className="ll-cx-count-total"> / {pad(items.length)}</span>
                </span>
                <button
                  type="button"
                  className="ll-carousel-btn ll-cx-btn"
                  onClick={() => go(1)}
                  aria-label="Next testimonial"
                >
                  <ArrowRightIcon size={18} />
                </button>
              </div>

              <div className="ll-cx-dots">
                {items.map((item, i) => (
                  <button
                    key={item.author}
                    type="button"
                    className={`ll-cx-dot${i === active ? ' is-active' : ''}`}
                    onClick={() => setActive(i)}
                    aria-label={`Show testimonial ${i + 1}: ${item.author}`}
                    aria-current={i === active ? 'true' : undefined}
                  />
                ))}
              </div>
            </div>

            <div className="ll-cx-ctas">
              <Link href="/contact" className="ll-btn ll-btn-primary">
                <span>Speak With an Advisor</span>
                <ArrowUpRightIcon size={15} />
              </Link>
              <Link href="/about" className="ll-btn ll-btn-outline-light">
                About Leap Living
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
