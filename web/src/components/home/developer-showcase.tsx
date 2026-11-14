'use client'

import { useState } from 'react'
import { DEVELOPER_BRANDS, type DeveloperBrand } from '@/data/catalog'
import { PauseIcon, PlayIcon } from '@/components/ui/icons'

interface DeveloperShowcaseProps {
  /**
   * Section surface.
   * - `glass-light` (default): skyline photo under a light scrim, frosted white
   *   tiles, grey logos that turn full colour on hover.
   * - `glass`: skyline photo under a deep-teal scrim, white logos.
   * - `light` / `muted`: flat surfaces.
   */
  surface?: 'glass-light' | 'glass' | 'light' | 'muted'
  /** Optional index shown in the numbered eyebrow (e.g. "06"). */
  index?: string
  title?: string
}

function DeveloperTile({ brand }: { brand: DeveloperBrand }) {
  return (
    <li className="ll-marquee-item">
      {brand.logo ? (
        // Plain <img>: tiny static PNGs, explicit size avoids layout shift.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logo}
          alt={brand.name}
          width={brand.width}
          height={brand.height}
          loading="lazy"
          decoding="async"
          className="ll-marquee-logo"
        />
      ) : (
        <span className="ll-marquee-wordmark">{brand.name}</span>
      )}
    </li>
  )
}

/**
 * Continuously scrolling developer logo strip.
 * - Pure CSS animation (transform only), list rendered twice for a seamless loop.
 * - Pauses on hover / keyboard focus, and via an explicit Pause button
 *   (WCAG 2.2.2 Pause, Stop, Hide).
 * - Honours prefers-reduced-motion: becomes a static wrapped grid.
 */
export function DeveloperShowcase({
  surface = 'glass-light',
  index,
  title = 'Developers We Work With Across the UAE',
}: DeveloperShowcaseProps) {
  const [paused, setPaused] = useState(false)

  return (
    <section
      className={`ll-dev-showcase ll-section-${surface}`}
      aria-labelledby="ll-dev-showcase-title"
    >
      {(surface === 'glass' || surface === 'glass-light') && (
        <div className="ll-section-image-bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/developer-network-skyline.jpg"
            srcSet="/images/developer-network-skyline-960.jpg 960w, /images/developer-network-skyline.jpg 1920w"
            sizes="100vw"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div className="ll-dev-glass-scrim" />
        </div>
      )}
      <div className="ll-container ll-dev-showcase-head">
        <div>
          <div className="ll-eyebrow">
            {index && <span className="ll-eyebrow-num">{index}</span>}
            Developer Network
          </div>
          <h2 id="ll-dev-showcase-title" className="ll-serif-title ll-section-title">
            {title}
          </h2>
          <p className="ll-dev-showcase-lead">
            Executive relationships across Tier-1 master developers in Dubai and Abu Dhabi.
          </p>
        </div>

        <button
          type="button"
          className="ll-marquee-toggle"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? 'Play developer logo animation' : 'Pause developer logo animation'}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
          <span>{paused ? 'Play' : 'Pause'}</span>
        </button>
      </div>

      <div className={`ll-marquee${paused ? ' is-paused' : ''}`}>
        <div className="ll-marquee-track">
          <ul className="ll-marquee-list" aria-label="Developers we work with">
            {DEVELOPER_BRANDS.map((brand) => (
              <DeveloperTile key={brand.name} brand={brand} />
            ))}
          </ul>
          {/* Visual duplicate for the seamless loop; hidden from assistive tech. */}
          <ul className="ll-marquee-list" aria-hidden="true">
            {DEVELOPER_BRANDS.map((brand) => (
              <DeveloperTile key={`dup-${brand.name}`} brand={brand} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
