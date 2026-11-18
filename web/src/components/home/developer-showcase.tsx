import type { CSSProperties } from 'react'
import type { DeveloperBrand } from '@/data/catalog'
import { KeyholeMark } from '@/components/ui/keyhole-mark'

interface DeveloperShowcaseProps {
  /** Visible developers in strip order (Admin → Developers) */
  brands: DeveloperBrand[]
}

function DeveloperTile({ brand }: { brand: DeveloperBrand }) {
  return (
    <li className="ll-marquee-item">
      {brand.logo ? (
        // Plain <img>: tiny static PNGs (~8 KB each), explicit size avoids layout shift.
        // Eager on purpose: inside the clipped strip a lazy logo only starts loading once it is
        // already visible, so it glided in as an empty gap (worst at the loop seam).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logo}
          alt={brand.name}
          width={brand.width}
          height={brand.height}
          loading="eager"
          fetchPriority="low"
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
 * Surface: flat brand-teal tint gradient with the large white keyhole watermark, no photo
 * (owner, 2026-11-18); bare full-colour logos glide across it.
 *
 * Continuously scrolling developer logo strip, logos only (owner, 2026-11-17: no heading,
 * description or Pause button).
 * - Pure CSS animation (transform only), list rendered twice for a seamless loop.
 * - Pauses while hovered or focused, so a logo can be read.
 * - Honours prefers-reduced-motion: becomes a static wrapped grid.
 */
export function DeveloperShowcase({ brands }: DeveloperShowcaseProps) {
  if (brands.length === 0) return null
  return (
    <section
      className="ll-dev-showcase ll-section-glass-light"
      aria-label="Developers we work with"
    >
      {/* Brand watermark: the keyhole mark, large and cropped by the section edge. */}
      <KeyholeMark className="ll-keyhole ll-keyhole-dev" strokeWidth={1.4} />

      {/* Contained like every other section: same width and gutters as the page content. */}
      <div className="ll-container">
        {/* Loop length scales with the logo count so the glide speed stays constant. */}
        <div className="ll-marquee" style={{ '--marquee-items': brands.length } as CSSProperties}>
          <div className="ll-marquee-track">
            <ul className="ll-marquee-list">
              {brands.map((brand) => (
                <DeveloperTile key={brand.name} brand={brand} />
              ))}
            </ul>
            {/* Visual duplicate for the seamless loop; hidden from assistive tech. */}
            <ul className="ll-marquee-list" aria-hidden="true">
              {brands.map((brand) => (
                <DeveloperTile key={`dup-${brand.name}`} brand={brand} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
