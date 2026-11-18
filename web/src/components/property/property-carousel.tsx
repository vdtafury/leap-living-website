import Link from 'next/link'
import type { ReactNode } from 'react'
import type { PropertyListing } from '@/data/catalog'
import { PropertyCard } from '@/components/property/property-card'
import { Carousel } from '@/components/ui/carousel'
import { ArrowRightIcon } from '@/components/ui/icons'
import { KeyholeMark } from '@/components/ui/keyhole-mark'

interface PropertyCarouselProps {
  items: PropertyListing[]
  /** Accessible name of the carousel region. */
  label: string
  /** Left side of the section header (the section title). */
  children: ReactNode
  /** Right side of the header (e.g. "View all" link). */
  action?: ReactNode
  /** Closing "view all" card (D-47): where it goes, its label, and how many listings wait there. */
  viewAll?: { href: string; label: string; total: number }
}

/** Featured properties: property cards in the shared carousel, ending on a "View all" card. */
export function PropertyCarousel({
  items,
  label,
  children,
  action,
  viewAll,
}: PropertyCarouselProps) {
  return (
    <Carousel
      label={label}
      noun="property"
      nounPlural="properties"
      action={action}
      bleed
      slides={items.map((property) => ({
        key: property.slug,
        node: <PropertyCard property={property} />,
      }))}
      endSlide={
        viewAll && (
          <Link href={viewAll.href} className="ll-carousel-endcard">
            <KeyholeMark className="ll-keyhole ll-carousel-endcard-mark" strokeWidth={1.4} />
            <span className="ll-carousel-endcard-num tabular-nums">{viewAll.total}</span>
            <span className="ll-carousel-endcard-text">
              {viewAll.total === 1 ? 'property' : 'properties'} for sale, all in one place
            </span>
            <span className="ll-carousel-endcard-cta">
              {viewAll.label}
              <span className="ll-carousel-endcard-icon" aria-hidden="true">
                <ArrowRightIcon size={18} />
              </span>
            </span>
          </Link>
        )
      }
    >
      {children}
    </Carousel>
  )
}
