import type { CSSProperties } from 'react'
import { DEVELOPER_BRANDS, type DeveloperBrand } from '@/data/catalog'
import { KeyholeMark } from '@/components/ui/keyhole-mark'
import { ResponsiveImg } from '@/components/ui/responsive-img'

interface DeveloperShowcaseProps {
  /**
   * Section surface.
   * - `glass-light` (default): skyline photo under a light scrim; bare
   *   full-colour logos glide across it (no tiles, frames or band).
   * - `glass`: skyline photo under a deep-teal scrim, bare white logos.
   * - `light` / `muted`: flat surfaces.
   */
  surface?: 'glass-light' | 'glass' | 'light' | 'muted'
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
 * Continuously scrolling developer logo strip, logos only (owner, 2026-11-17: no heading,
 * description or Pause button).
 * - Pure CSS animation (transform only), list rendered twice for a seamless loop.
 * - Pauses while hovered or focused, so a logo can be read.
 * - Honours prefers-reduced-motion: becomes a static wrapped grid.
 */
export function DeveloperShowcase({ surface = 'glass-light' }: DeveloperShowcaseProps) {
  return (
    <section
      className={`ll-dev-showcase ll-section-${surface}`}
      aria-label="Developers we work with"
    >
      {(surface === 'glass' || surface === 'glass-light') && (
        <div className="ll-section-image-bg" aria-hidden="true">
          <ResponsiveImg src="/images/developer-network-skyline.jpg" sizes="100vw" />
          <div className="ll-dev-glass-scrim" />
        </div>
      )}
      {/* Brand watermark: the Leap Living keyhole mark, large and cropped by the
          section edge, the way the Brand Guidelines use it on the cover. */}
      <KeyholeMark className="ll-keyhole ll-keyhole-dev" strokeWidth={1.4} />

      {/* Contained like every other section: same width and gutters as the page content. */}
      <div className="ll-container">
        {/* Loop length scales with the logo count so the glide speed stays constant. */}
        <div
          className="ll-marquee"
          style={{ '--marquee-items': DEVELOPER_BRANDS.length } as CSSProperties}
        >
          <div className="ll-marquee-track">
            <ul className="ll-marquee-list">
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
      </div>
    </section>
  )
}
