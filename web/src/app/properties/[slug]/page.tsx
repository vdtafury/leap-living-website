import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ComponentType } from 'react'
import { pageMetadata } from '@/lib/seo'
import {
  DEFAULT_INTEREST_RATE,
  DEFAULT_LOAN_YEARS,
  defaultDownPayment,
  monthlyPayment,
} from '@/lib/mortgage'
import { SaveButton } from '@/components/account/save-button'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ConsultationForm } from '@/components/forms/consultation-form'
import { MortgageCalculator } from '@/components/tools/mortgage-calculator'
import { PropertyCard } from '@/components/property/property-card'
import { PropertyGallery } from '@/components/property/detail/property-gallery'
import {
  PropertyContactDock,
  PropertyDealCard,
  ViewingDirectLines,
  type DealListing,
} from '@/components/property/detail/property-contact'
import { ShareButton } from '@/components/property/detail/share-button'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import {
  AreaIcon,
  ArrowRightIcon,
  BathIcon,
  BedIcon,
  BuildingIcon,
  CheckIcon,
  ChevronRightIcon,
  MapPinIcon,
} from '@/components/ui/icons'
import { getPublishedProperty, listPublishedProperties } from '@/modules/listings'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const property = await getPublishedProperty(slug)
  if (!property) return { title: 'Property Not Found | LEAP LIVING' }

  return pageMetadata({
    title: `${property.title} — ${property.community} | LEAP LIVING`,
    description: property.subtitle || property.description.slice(0, 160),
    path: `/properties/${property.slug}`,
    image: property.heroImage ? { url: property.heroImage, alt: property.title } : undefined,
  })
}

type Fact = { icon: ComponentType<{ size?: number }>; value: string; label: string }

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Published and not deleted only: drafts and archived listings are a 404 for visitors.
  const property = await getPublishedProperty(slug)

  if (!property) notFound()

  const isBuy = property.transactionType === 'BUY'
  const backHref = isBuy ? '/buy' : '/rent'
  const backLabel = isBuy ? 'Buy' : 'Rent'
  const path = `/properties/${property.slug}`
  const images =
    property.gallery.length > 0 ? property.gallery : property.heroImage ? [property.heroImage] : []

  // Same starting figures as the calculator further down, so the two always agree.
  const monthly = isBuy
    ? monthlyPayment({
        price: property.priceAed,
        downPaymentPercent: defaultDownPayment(property.priceAed),
        interestRatePercent: DEFAULT_INTEREST_RATE,
        years: DEFAULT_LOAN_YEARS,
      })
    : null
  const monthlyEstimate =
    monthly && monthly > 0 ? `AED ${Math.round(monthly).toLocaleString('en-US')}` : null

  const listing: DealListing = {
    title: property.title,
    refCode: property.refCode,
    path,
    transactionType: property.transactionType,
    statusLabel: property.statusLabel,
    priceLabel: property.priceLabel,
    priceFrequency: property.priceFrequency,
  }

  const facts: Fact[] = [
    { icon: BuildingIcon, value: property.propertyType, label: 'Property type' },
    ...(property.beds > 0
      ? [{ icon: BedIcon, value: String(property.beds), label: plural(property.beds, 'Bedroom') }]
      : []),
    ...(property.baths > 0
      ? [
          {
            icon: BathIcon,
            value: String(property.baths),
            label: plural(property.baths, 'Bathroom'),
          },
        ]
      : []),
    { icon: AreaIcon, value: property.areaFormatted, label: 'Built-up area' },
  ]

  const details: [string, string][] = [
    ['Reference', property.refCode],
    ['Status', property.statusLabel],
    ['Property type', property.propertyType],
    ['Community', property.community],
    ['Emirate', property.emirate],
    ...(property.developer ? [['Developer', property.developer] as [string, string]] : []),
    ...(property.beds > 0 ? [['Bedrooms', String(property.beds)] as [string, string]] : []),
    ...(property.baths > 0 ? [['Bathrooms', String(property.baths)] as [string, string]] : []),
    ['Built-up area', property.areaFormatted],
    [
      isBuy ? 'Asking price' : 'Annual lease',
      `${property.priceLabel}${property.priceFrequency ? ` ${property.priceFrequency}` : ''}`,
    ],
  ]

  const more = (await listPublishedProperties({ transactionType: property.transactionType }))
    .filter((item) => item.slug !== property.slug)
    .slice(0, 3)

  return (
    <>
      <SiteHeader />

      <main className="ll-pd">
        <section className="ll-pd-top">
          <div className="ll-container">
            <div className="ll-pd-head">
              <nav className="ll-pd-crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRightIcon size={13} />
                <Link href={backHref}>{backLabel}</Link>
                <ChevronRightIcon size={13} />
                <span aria-current="page">{property.title}</span>
              </nav>

              <div className="ll-pd-title-row">
                <div className="ll-pd-title-copy">
                  <div className="ll-pd-tags">
                    <span className="ll-pd-tag ll-pd-tag--mode">
                      {isBuy ? 'For sale' : 'For rent'}
                    </span>
                    <span className="ll-pd-tag">{property.statusLabel}</span>
                  </div>
                  <h1 className="ll-pd-title">{property.title}</h1>
                  <p className="ll-pd-location">
                    <MapPinIcon size={16} />
                    <span>
                      {property.community}, {property.emirate}
                    </span>
                  </p>
                </div>

                <div className="ll-pd-tools">
                  <ShareButton title={property.title} />
                  <SaveButton
                    type="PROPERTY"
                    id={property.id}
                    title={property.title}
                    variant="detail"
                  />
                </div>
              </div>
            </div>

            <div className="ll-pd-layout">
              <div className="ll-pd-media">
                <PropertyGallery images={images} title={property.title} />
              </div>

              <aside className="ll-pd-aside" aria-label="Price and contact">
                <PropertyDealCard listing={listing} monthlyEstimate={monthlyEstimate} />
              </aside>

              <div className="ll-pd-main">
                <ul className="ll-pd-facts" aria-label="Key facts">
                  {facts.map(({ icon: Icon, value, label }) => (
                    <li key={label}>
                      <span className="ll-pd-fact-icon">
                        <Icon size={20} />
                      </span>
                      <span className="ll-pd-fact-text">
                        <strong className="tabular-nums">{value}</strong>
                        <span>{label}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <section className="ll-pd-block ll-pd-overview" aria-labelledby="pd-overview">
                  <span className="ll-pd-kicker">Overview</span>
                  <h2 id="pd-overview" className="ll-pd-h2">
                    {property.subtitle || property.title}
                  </h2>
                  <p>{property.description}</p>
                </section>

                {property.highlights.length > 0 && (
                  <section className="ll-pd-block" aria-labelledby="pd-highlights">
                    <h2 id="pd-highlights" className="ll-pd-h3">
                      Highlights
                    </h2>
                    <ul className="ll-pd-highlights">
                      {property.highlights.map((item) => (
                        <li key={item}>
                          <span className="ll-pd-check">
                            <CheckIcon size={14} />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="ll-pd-block" aria-labelledby="pd-details">
                  <h2 id="pd-details" className="ll-pd-h3">
                    Property details
                  </h2>
                  <dl className="ll-pd-details">
                    {details.map(([term, value]) => (
                      <div key={term}>
                        <dt>{term}</dt>
                        <dd className="tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                {isBuy && (
                  <section
                    id="financing"
                    className="ll-pd-block ll-pd-finance"
                    aria-labelledby="pd-finance"
                  >
                    <h2 id="pd-finance" className="ll-pd-h3">
                      Estimate your mortgage
                    </h2>
                    <MortgageCalculator variant="property" initialPrice={property.priceAed} />
                  </section>
                )}

                <section id="viewing" className="ll-pd-viewing" aria-labelledby="pd-viewing">
                  <div className="ll-pd-viewing-copy">
                    <h2 id="pd-viewing">Arrange a private viewing</h2>
                    <p>
                      Speak directly with our advisory team about {property.title} (Ref{' '}
                      {property.refCode}).
                    </p>
                    {images[0] && (
                      <div className="ll-pd-viewing-home">
                        <ResponsiveImg src={images[0]} sizes="120px" alt="" />
                        <div>
                          <strong>{property.title}</strong>
                          <span className="tabular-nums">
                            {property.priceLabel}
                            {property.priceFrequency ? ` ${property.priceFrequency}` : ''}
                          </span>
                        </div>
                      </div>
                    )}
                    <ViewingDirectLines />
                  </div>
                  <ConsultationForm mode="PROPERTY_INQUIRY" contextTitle={property.title} />
                </section>
              </div>
            </div>
          </div>
        </section>

        {more.length > 0 && (
          <section className="ll-pd-more" aria-labelledby="pd-more">
            <div className="ll-container">
              <div className="ll-pd-more-head">
                <h2 id="pd-more">{isBuy ? 'More homes for sale' : 'More homes for rent'}</h2>
                <Link href={backHref} className="ll-pd-more-all">
                  <span>{isBuy ? 'View all for sale' : 'View all for rent'}</span>
                  <ArrowRightIcon size={15} />
                </Link>
              </div>
              <div className="ll-pd-more-grid">
                {more.map((item) => (
                  <PropertyCard key={item.slug} property={item} />
                ))}
              </div>
            </div>
          </section>
        )}

        <PropertyContactDock listing={listing} />
      </main>

      <SiteFooter />
    </>
  )
}

function plural(count: number, word: string) {
  return count === 1 ? word : `${word}s`
}
