import type { ReactNode } from 'react'
import type { PropertyListing } from '@/data/catalog'
import { PropertyCard } from '@/components/property/property-card'
import { Carousel } from '@/components/ui/carousel'

interface PropertyCarouselProps {
  items: PropertyListing[]
  /** Accessible name of the carousel region. */
  label: string
  /** Left side of the section header (the section title). */
  children: ReactNode
  /** Extra action shown next to the arrows (e.g. "View all" link). */
  action?: ReactNode
}

/** Featured properties: property cards in the shared carousel. */
export function PropertyCarousel({ items, label, children, action }: PropertyCarouselProps) {
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
    >
      {children}
    </Carousel>
  )
}
