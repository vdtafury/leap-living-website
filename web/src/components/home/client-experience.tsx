'use client'

import Link from 'next/link'
import { useRef, useState, type KeyboardEvent } from 'react'
import type { HomeContent } from '@/data/content-defaults'
import { ArrowUpRightIcon, AvatarIcon } from '@/components/ui/icons'

/**
 * Homepage client reviews as a "client index" (owner, 2026-11-18: no section may look like
 * another, so no carousel, arrows, counter or card row like the listings above).
 * Left: the reviewers (generic man / woman avatar, name, role). Right: one large panel with the
 * chosen client's review. Accessible tabs: arrow keys / Home / End move between reviewers.
 * Every review is in the HTML (search engines, no JavaScript); panels share one grid cell so the
 * panel keeps the height of the longest review and never jumps when switching.
 */
export function ClientExperience({ title, linkLabel, linkHref, items }: HomeContent['reviews']) {
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
        <h2 id="ll-reviews-title" className="ll-serif-title ll-section-title ll-reviews-heading">
          {title}
        </h2>
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
                  <span className="ll-reviews-role">{review.role}</span>
                </span>
              </button>
            ))}
          </div>

          <Link href={linkHref} className="ll-link-arrow ll-reviews-link">
            {linkLabel}
            <ArrowUpRightIcon size={15} />
          </Link>
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
                  <span className="ll-reviews-role">{review.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
