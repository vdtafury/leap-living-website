'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import type { DeveloperBrand, ProjectItem } from '@/data/catalog'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import { SaveButton } from '@/components/account/save-button'
import { ArrowUpRightIcon, MapPinIcon } from '@/components/ui/icons'

/** Panels side by side at most (the homepage shows the projects marked Featured). */
const MAX_PANELS = 5
const SLIDER_QUERY = '(max-width: 899px)'

const SEGMENT: Record<ProjectItem['segment'], string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  'MIXED-USE': 'Mixed-Use',
}

/**
 * Homepage projects as expanding panels (owner, 2026-11-18: "a completely different design",
 * since the card row looked like the featured properties above). Tall photo panels side by
 * side; the open one widens and shows the project (developer logo, status, price, handover,
 * payment plan), the others narrow to a photo strip with the name written vertically.
 *
 * Opens on hover, keyboard focus (Tab walks through the projects) or a tap; a tap on a closed
 * panel only opens it, the open one links to the project. Phones: the same idea stacked
 * vertically (an accordion of photo strips). Every project is in the server HTML.
 */
export function ProjectPanels({
  projects,
  developers,
}: {
  projects: ProjectItem[]
  developers: DeveloperBrand[]
}) {
  const [active, setActive] = useState(0)
  const [slide, setSlide] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const items = projects.slice(0, MAX_PANELS)

  // Phones: the panels become a swipe slider; the dots follow the card in view.
  useEffect(() => {
    const el = track.current
    if (!el) return
    const onScroll = () => {
      const cards = [...el.children] as HTMLElement[]
      const left = el.scrollLeft
      let best = 0
      cards.forEach((card, i) => {
        if (
          Math.abs(card.offsetLeft - el.offsetLeft - left) <
          Math.abs(cards[best].offsetLeft - el.offsetLeft - left)
        )
          best = i
      })
      setSlide(best)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  if (items.length === 0) return null
  const logos = new Map(developers.map((d) => [d.name.toLowerCase(), d]))

  const goTo = (index: number) => {
    const el = track.current
    const card = el?.children[index] as HTMLElement | undefined
    if (!el || !card) return
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: smooth ? 'smooth' : 'auto' })
  }

  return (
    <>
      <div ref={track} className="ll-xp" style={{ '--ll-xp-count': items.length } as CSSProperties}>
        {items.map((project, index) => {
          const open = index === active
          const href = `/projects/${project.slug}`
          const logo = logos.get(project.developer.toLowerCase())
          const onClickCapture = (event: MouseEvent) => {
            // First tap on a closed panel opens it (touch has no hover); nothing else happens.
            // In the phone slider every card is already open, so a tap simply follows the link.
            if (open || window.matchMedia(SLIDER_QUERY).matches) return
            event.preventDefault()
            event.stopPropagation()
            setActive(index)
          }
          return (
            <article
              key={project.slug}
              className="ll-xp-panel"
              data-open={open}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClickCapture={onClickCapture}
            >
              <div className="ll-xp-media" aria-hidden="true">
                <ResponsiveImg src={project.heroImage} sizes="(max-width: 899px) 100vw, 900px" />
              </div>
              <span className="ll-xp-shade" aria-hidden="true" />
              <span className="ll-xp-num tabular-nums" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Closed: the name along the strip */}
              <div className="ll-xp-rail" aria-hidden="true">
                <span className="ll-xp-rail-title">{project.title}</span>
                <span className="ll-xp-rail-meta">{project.community}</span>
              </div>

              <SaveButton type="PROJECT" id={project.id} title={project.title} />

              {/* Open: the project. Keyboard: tabbing into a closed panel opens it. */}
              <div className="ll-xp-body">
                <div className="ll-xp-inner">
                  <div className="ll-xp-top">
                    <span className="ll-chip ll-chip-teal">{project.status}</span>
                    <span className="ll-xp-dev">
                      {logo?.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logo.logo}
                          alt={project.developer}
                          width={logo.width}
                          height={logo.height}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        project.developer
                      )}
                    </span>
                  </div>
                  <p className="ll-xp-kicker">
                    <MapPinIcon size={14} />
                    <span>
                      {project.community} · {SEGMENT[project.segment]}
                    </span>
                  </p>
                  <h3 className="ll-xp-title">
                    <Link href={href} className="ll-xp-link">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="ll-xp-units">{project.unitTypes}</p>
                  <dl className="ll-xp-facts">
                    <div>
                      <dt>Starting price</dt>
                      <dd className="tabular-nums">
                        {project.startingPriceLabel.replace(/^From\s+/i, '')}
                      </dd>
                    </div>
                    <div>
                      <dt>Handover</dt>
                      <dd>{project.handoverLabel}</dd>
                    </div>
                    <div>
                      <dt>Payment plan</dt>
                      <dd>{project.paymentPlan}</dd>
                    </div>
                  </dl>
                  <span className="ll-xp-cta" aria-hidden="true">
                    Explore Development
                    <span className="ll-xp-cta-icon">
                      <ArrowUpRightIcon size={15} />
                    </span>
                  </span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {items.length > 1 && (
        <div className="ll-xp-dots" role="group" aria-label="Choose a project">
          {items.map((project, index) => (
            <button
              key={project.slug}
              type="button"
              className="ll-xp-dot"
              aria-label={`Show ${project.title}`}
              aria-current={index === slide}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </>
  )
}
