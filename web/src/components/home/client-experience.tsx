'use client'

import Link from 'next/link'
import { useRef, useState, type KeyboardEvent } from 'react'
import type { HomepageReview } from '@/modules/reviews'
import { ArrowUpRightIcon, AvatarIcon } from '@/components/ui/icons'
import { Stars } from '@/components/ui/stars'

interface ClientExperienceProps {
  title: string
  linkLabel: string
  linkHref: string
  /** Published reviews first, then the samples while there are fewer than 3 real ones (D-44) */
  items: HomepageReview[]
  /** Average and count of the published reviews; null while the samples are shown */
  summary: { average: number; count: number } | null
}

/** Signed out, this page sends the visitor to sign in and comes back (D-44). */
const WRITE_HREF = '/account/review'

/**
 * Homepage client reviews as a "client index" (owner, 2026-11-18: no section may look like
 * another, so no carousel, arrows, counter or card row like the listings above).
 * Left: the reviewers (generic man / woman avatar, name, role). Right: one large panel with the
 * chosen client's review. Accessible tabs: arrow keys / Home / End move between reviewers.
 * Every review is in the HTML (search engines, no JavaScript); panels share one grid cell so the
 * panel keeps the height of the longest review and never jumps when switching.
 */
export function ClientExperience({
  title,
  linkLabel,
  linkHref,
  items,
  summary,
}: ClientExperienceProps) {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  if (items.length === 0) return null

  const select = (index: number, focus = false) => {
    const next = (index + items.length) % items.length
    setActive(next)
    if (focus) tabs.current[next]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: items.length - 1,
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    select(moves[event.key], true)
  }

  return (
    <section
      className="ll-section-plain ll-reviews ll-defer-render"
      aria-labelledby="ll-reviews-title"
    >
      <div className="ll-container ll-reviews-layout">
        <div className="ll-reviews-heading">
          <h2 id="ll-reviews-title" className="ll-serif-title ll-section-title">
            {title}
          </h2>
          {summary && (
            <p className="ll-reviews-summary">
              <span className="ll-reviews-summary-score tabular-nums">
                {summary.average.toFixed(1)}
              </span>
              <Stars rating={summary.average} size={17} />
              <span className="ll-reviews-summary-count">
                from {summary.count} client {summary.count === 1 ? 'review' : 'reviews'}
              </span>
            </p>
          )}
        </div>
        <div className="ll-reviews-side">
          <div
            className="ll-reviews-index"
            role="tablist"
            aria-label="Clients"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
          >
            {items.map((review, index) => (
              <button
                key={`${review.author}-${index}`}
                ref={(el) => {
                  tabs.current[index] = el
                }}
                type="button"
                role="tab"
                id={`ll-review-tab-${index}`}
                aria-controls={`ll-review-panel-${index}`}
                aria-selected={index === active}
                tabIndex={index === active ? 0 : -1}
                className="ll-reviews-person"
                onClick={() => select(index)}
              >
                <span className="ll-reviews-avatar">
                  <AvatarIcon variant={review.avatar} size={44} />
                </span>
                <span className="ll-reviews-who">
                  <span className="ll-reviews-name">{review.author}</span>
                  {review.role && <span className="ll-reviews-role">{review.role}</span>}
                </span>
                <Stars rating={review.rating} size={12} className="ll-reviews-mini-stars" />
              </button>
            ))}
          </div>

          <div className="ll-reviews-link">
            <Link href={WRITE_HREF} className="ll-btn ll-btn-primary ll-reviews-write">
              Share your experience
            </Link>
            <Link href={linkHref} className="ll-link-arrow">
              {linkLabel}
              <ArrowUpRightIcon size={15} />
            </Link>
          </div>
        </div>

        <div className="ll-reviews-stage">
          {items.map((review, index) => (
            <figure
              key={`${review.author}-${index}`}
              id={`ll-review-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`ll-review-tab-${index}`}
              aria-hidden={index !== active}
              data-active={index === active}
              className="ll-reviews-panel"
            >
              <Stars rating={review.rating} size={19} className="ll-reviews-stars" />
              <h3 className="ll-reviews-title">{review.title}</h3>
              <blockquote className="ll-reviews-quote">
                <p>{review.quote}</p>
              </blockquote>
              <figcaption className="ll-reviews-by">
                <span className="ll-reviews-avatar ll-reviews-avatar--lg">
                  <AvatarIcon variant={review.avatar} size={56} />
                </span>
                <span className="ll-reviews-who">
                  <span className="ll-reviews-name">{review.author}</span>
                  {review.role && <span className="ll-reviews-role">{review.role}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
