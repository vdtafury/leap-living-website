'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { HomepageReview, ReviewSummary } from '@/modules/reviews'
import { ArrowUpRightIcon, AvatarIcon } from '@/components/ui/icons'
import { Stars } from '@/components/ui/stars'

interface ClientExperienceProps {
  title: string
  linkLabel: string
  linkHref: string
  /** Published reviews first, then the samples while there are fewer than 3 real ones (D-44) */
  items: HomepageReview[]
  /** Average, count and star breakdown of the published reviews; null while samples show */
  summary: ReviewSummary | null
}

/** Signed out, this page sends the visitor to sign in and comes back (D-44). */
const WRITE_HREF = '/account/review'
/** Longer quotes are clamped with a "Read more" (the card grid keeps even rows). */
const LONG_QUOTE = 240
/** Phones show this many cards, then "Show all reviews". */
const PHONE_VISIBLE = 3

/**
 * Homepage client reviews as a review wall (owner, 2026-11-18: "show them all at the same time,
 * professionally, like the big sites"). After Airbnb / Trustpilot / Google reviews: a header with
 * the rating summary and the actions, then every review as a card in a grid (3 / 2 / 1 columns),
 * in reading order, newest first. No carousel, arrows or photos, so it looks like nothing else on
 * the page (D-42). Every review is in the HTML.
 */
export function ClientExperience({
  title,
  linkLabel,
  linkHref,
  items,
  summary,
}: ClientExperienceProps) {
  const [showAll, setShowAll] = useState(false)
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set())
  if (items.length === 0) return null

  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  return (
    <section
      className="ll-section-plain ll-reviews ll-defer-render"
      aria-labelledby="ll-reviews-title"
    >
      <div className="ll-container">
        <header className="ll-rw-head">
          <div className="ll-rw-head-main">
            <h2 id="ll-reviews-title" className="ll-serif-title ll-section-title">
              {title}
            </h2>
            {summary && (
              <div className="ll-rw-summary">
                <div className="ll-rw-score">
                  <span className="ll-rw-score-num tabular-nums">{summary.average.toFixed(1)}</span>
                  <span className="ll-rw-score-side">
                    <Stars rating={summary.average} size={18} />
                    <span className="ll-rw-score-count">
                      Based on {summary.count} client {summary.count === 1 ? 'review' : 'reviews'}
                    </span>
                  </span>
                </div>
                <ul className="ll-rw-bars" aria-label="Reviews by star rating">
                  {summary.breakdown.map((row) => (
                    <li key={row.stars} className="ll-rw-bar">
                      <span className="ll-rw-bar-label tabular-nums">{row.stars}★</span>
                      <span className="ll-rw-bar-track" aria-hidden="true">
                        <span
                          className="ll-rw-bar-fill"
                          style={{ width: `${(row.count / summary.count) * 100}%` }}
                        />
                      </span>
                      <span className="ll-rw-bar-count tabular-nums">
                        {row.count}
                        <span className="sr-only">
                          {' '}
                          with {row.stars} {row.stars === 1 ? 'star' : 'stars'}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="ll-rw-actions">
            <Link href={WRITE_HREF} className="ll-btn ll-btn-primary ll-reviews-write">
              Share your experience
            </Link>
            <Link href={linkHref} className="ll-link-arrow">
              {linkLabel}
              <ArrowUpRightIcon size={15} />
            </Link>
          </div>
        </header>

        <ul className="ll-rw-grid" data-show-all={showAll}>
          {items.map((review, index) => {
            const long = review.quote.length > LONG_QUOTE
            const expanded = open.has(index)
            const quoteId = `ll-rw-quote-${index}`
            return (
              <li key={`${review.author}-${index}`} className="ll-rw-card">
                <figure className="ll-rw-figure">
                  <div className="ll-rw-card-top">
                    <Stars rating={review.rating} size={16} />
                    <span className="ll-rw-mark" aria-hidden="true">
                      &ldquo;
                    </span>
                  </div>
                  <h3 className="ll-rw-title">{review.title}</h3>
                  <blockquote id={quoteId} className="ll-rw-quote" data-clamped={long && !expanded}>
                    <p>{review.quote}</p>
                  </blockquote>
                  {long && (
                    <button
                      type="button"
                      className="ll-rw-more"
                      aria-expanded={expanded}
                      aria-controls={quoteId}
                      onClick={() => toggle(index)}
                    >
                      {expanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                  <figcaption className="ll-rw-by">
                    <span className="ll-reviews-avatar">
                      <AvatarIcon variant={review.avatar} size={44} />
                    </span>
                    <span className="ll-reviews-who">
                      <span className="ll-reviews-name">{review.author}</span>
                      {review.role && <span className="ll-reviews-role">{review.role}</span>}
                    </span>
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>

        {items.length > PHONE_VISIBLE && !showAll && (
          <button type="button" className="ll-rw-all" onClick={() => setShowAll(true)}>
            Show all {items.length} reviews
          </button>
        )}
      </div>
    </section>
  )
}
