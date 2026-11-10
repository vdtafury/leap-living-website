import Link from 'next/link'
import type { PropertyListing } from '@/data/catalog'
import { AreaIcon, ArrowUpRightIcon, BathIcon, BedIcon, MapPinIcon } from '@/components/ui/icons'

export function PropertyCard({ property }: { property: PropertyListing }) {
  return (
    <article className="ll-property-card">
      <Link href={`/properties/${property.slug}`} className="ll-property-media">
        <img src={property.heroImage} alt={property.title} />
        <div className="ll-property-media-badges">
          <span
            className={`ll-card-tag ${
              property.statusLabel === 'Private Advisory' || property.statusLabel === 'Exclusive Mandate'
                ? 'll-card-tag-teal'
                : 'll-card-tag-light'
            }`}
          >
            {property.statusLabel}
          </span>
          <span className="ll-card-tag ll-card-tag-dark">{property.propertyType}</span>
        </div>
      </Link>

      <div className="ll-property-body">
        <div className="ll-property-meta-top">
          <span>{property.refCode}</span>
          <span>{property.segment}</span>
        </div>

        <div className="ll-property-price tabular-nums">
          {property.priceLabel}
          {property.priceFrequency && (
            <span className="ll-property-freq"> {property.priceFrequency}</span>
          )}
        </div>

        <h3 className="ll-property-title">
          <Link href={`/properties/${property.slug}`}>{property.title}</Link>
        </h3>

        <div className="ll-property-location">
          <MapPinIcon size={14} />
          <span>
            {property.community}, {property.emirate}
          </span>
        </div>

        <div className="ll-property-specs">
          {property.beds > 0 && (
            <span className="ll-spec-item">
              <BedIcon size={15} />
              <span>{property.beds} Beds</span>
            </span>
          )}
          <span className="ll-spec-item">
            <BathIcon size={15} />
            <span>{property.baths} Baths</span>
          </span>
          <span className="ll-spec-item">
            <AreaIcon size={15} />
            <span>{property.areaFormatted}</span>
          </span>
        </div>

        <Link href={`/properties/${property.slug}`} className="ll-card-detail-link">
          <span>View Property Brief</span>
          <ArrowUpRightIcon size={15} />
        </Link>
      </div>
    </article>
  )
}
