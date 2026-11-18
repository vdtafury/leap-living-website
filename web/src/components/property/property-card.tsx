import Link from 'next/link'
import type { PropertyListing } from '@/data/catalog'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import { SaveButton } from '@/components/account/save-button'
import { ListingContact } from '@/components/property/listing-contact'
import { AreaIcon, ArrowUpRightIcon, BathIcon, BedIcon, MapPinIcon } from '@/components/ui/icons'

const HIGHLIGHT_STATUSES = new Set(['Private Advisory', 'Exclusive Mandate'])

/**
 * Property card (D-46). Every row uses the full width, so there is no empty corner:
 * meta + reference, title, price + Know More, one line of specs, then WhatsApp / Call / Email.
 */
export function PropertyCard({ property }: { property: PropertyListing }) {
  const href = `/properties/${property.slug}`
  const segmentLabel = property.segment === 'COMMERCIAL' ? 'Commercial' : 'Residential'

  return (
    <article className="ll-card ll-pc">
      <SaveButton type="PROPERTY" id={property.id} title={property.title} />
      <Link href={href} className="ll-card-media ll-pc-media" tabIndex={-1} aria-hidden="true">
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

      <div className="ll-pc-body">
        <div className="ll-pc-meta">
          <span className="ll-card-kicker">
            <span>{segmentLabel}</span>
            <span className="ll-card-kicker-dot" aria-hidden="true" />
            <span>{property.completionStatus}</span>
          </span>
          <span className="ll-pc-ref">{property.refCode}</span>
        </div>

        <h3 className="ll-pc-title">
          <Link href={href}>{property.title}</Link>
        </h3>

        <div className="ll-pc-price-row">
          <p className="ll-pc-price tabular-nums">
            {property.priceLabel}
            {property.priceFrequency && (
              <span className="ll-pc-price-freq"> {property.priceFrequency}</span>
            )}
          </p>
          <Link href={href} className="ll-pc-more">
            <span>Know More</span>
            <span className="sr-only"> about {property.title}</span>
            <span className="ll-pc-more-icon" aria-hidden="true">
              <ArrowUpRightIcon size={14} />
            </span>
          </Link>
        </div>

        <ul className="ll-pc-specs">
          {property.beds > 0 && (
            <li>
              <BedIcon size={16} />
              <span className="tabular-nums">{property.beds}</span>
              {property.beds === 1 ? 'Bed' : 'Beds'}
            </li>
          )}
          <li>
            <BathIcon size={16} />
            <span className="tabular-nums">{property.baths}</span>
            {property.baths === 1 ? 'Bath' : 'Baths'}
          </li>
          <li>
            <AreaIcon size={16} />
            <span className="tabular-nums">{property.areaFormatted}</span>
          </li>
        </ul>

        <ListingContact title={property.title} refCode={property.refCode} path={href} />
      </div>
    </article>
  )
}
