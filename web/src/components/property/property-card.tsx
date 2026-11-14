import Link from 'next/link'
import type { PropertyListing } from '@/data/catalog'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import { AreaIcon, ArrowUpRightIcon, BathIcon, BedIcon, MapPinIcon } from '@/components/ui/icons'

const HIGHLIGHT_STATUSES = new Set(['Private Advisory', 'Exclusive Mandate'])

export function PropertyCard({ property }: { property: PropertyListing }) {
  const href = `/properties/${property.slug}`
  const segmentLabel = property.segment === 'COMMERCIAL' ? 'Commercial' : 'Residential'

  return (
    <article className="ll-card">
      <Link href={href} className="ll-card-media" tabIndex={-1} aria-hidden="true">
        <ResponsiveImg
          src={property.heroImage}
          sizes="(max-width: 700px) 92vw, (max-width: 1120px) 46vw, 400px"
        />
        <span className="ll-card-media-shade" />
        <div className="ll-card-badges">
          <span
            className={`ll-chip ${HIGHLIGHT_STATUSES.has(property.statusLabel) ? 'll-chip-teal' : 'll-chip-glass'}`}
          >
            {property.statusLabel}
          </span>
          <span className="ll-chip ll-chip-glass">{property.propertyType}</span>
        </div>
        <div className="ll-card-media-foot">
          <MapPinIcon size={14} />
          <span>
            {property.community}, {property.emirate}
          </span>
        </div>
      </Link>

      <div className="ll-card-body">
        <div className="ll-card-kicker">
          <span>{segmentLabel}</span>
          <span className="ll-card-kicker-dot" aria-hidden="true" />
          <span>{property.completionStatus}</span>
        </div>

        <h3 className="ll-card-title">
          <Link href={href}>{property.title}</Link>
        </h3>

        <div className="ll-card-price tabular-nums">
          {property.priceLabel}
          {property.priceFrequency && (
            <span className="ll-card-price-freq"> {property.priceFrequency}</span>
          )}
        </div>

        <dl className="ll-card-specs">
          {property.beds > 0 && (
            <div className="ll-card-spec">
              <BedIcon size={16} />
              <dt>Beds</dt>
              <dd className="tabular-nums">{property.beds}</dd>
            </div>
          )}
          <div className="ll-card-spec">
            <BathIcon size={16} />
            <dt>Baths</dt>
            <dd className="tabular-nums">{property.baths}</dd>
          </div>
          <div className="ll-card-spec">
            <AreaIcon size={16} />
            <dt>Area</dt>
            <dd className="tabular-nums">{property.areaFormatted}</dd>
          </div>
        </dl>

        <div className="ll-card-foot">
          <span className="ll-card-ref">{property.refCode}</span>
          <Link href={href} className="ll-card-cta">
            <span>View Property Brief</span>
            <span className="ll-card-cta-icon" aria-hidden="true">
              <ArrowUpRightIcon size={14} />
            </span>
          </Link>
        </div>
      </div>
    </article>
  )
}
