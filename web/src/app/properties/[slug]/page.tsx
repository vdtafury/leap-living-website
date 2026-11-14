import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ConsultationForm } from '@/components/forms/consultation-form'
import { MortgageCalculator } from '@/components/tools/mortgage-calculator'
import { ImageGallery } from '@/components/ui/image-gallery'
import { CheckIcon, ChevronRightIcon, MapPinIcon } from '@/components/ui/icons'
import { PROPERTIES } from '@/data/catalog'

export function generateStaticParams() {
  return PROPERTIES.map((property) => ({ slug: property.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const property = PROPERTIES.find((p) => p.slug === slug)
  if (!property) return { title: 'Property Not Found | LEAP LIVING' }

  return {
    title: `${property.title} — ${property.community} | LEAP LIVING`,
    description: property.subtitle,
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const property = PROPERTIES.find((p) => p.slug === slug)

  if (!property) notFound()

  const backHref = property.transactionType === 'BUY' ? '/buy' : '/rent'
  const backLabel = property.transactionType === 'BUY' ? 'Buy' : 'Rent'

  return (
    <>
      <SiteHeader />

      <main>
        <section className="ll-page-hero" style={{ paddingBottom: '2.25rem' }}>
          <div className="ll-container">
            <div className="ll-breadcrumbs">
              <Link href="/">Home</Link>
              <ChevronRightIcon size={13} />
              <Link href={backHref}>{backLabel}</Link>
              <ChevronRightIcon size={13} />
              <span>{property.title}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div className="ll-eyebrow">
                  {property.refCode} · {property.statusLabel}
                </div>
                <h1 className="ll-page-hero-title" style={{ marginBottom: '0.45rem' }}>
                  {property.title}
                </h1>
                <div className="ll-property-location" style={{ fontSize: '0.92rem' }}>
                  <MapPinIcon size={16} />
                  <span>
                    {property.community}, {property.emirate}
                  </span>
                </div>
              </div>

              <div className="ll-hero-price">
                <div className="ll-hero-price-label">
                  {property.transactionType === 'BUY' ? 'Guide Asking Price' : 'Annual Lease'}
                </div>
                <div className="ll-hero-price-value tabular-nums">
                  {property.priceLabel}
                  {property.priceFrequency && (
                    <span className="ll-hero-price-freq">
                      {' '}
                      {property.priceFrequency}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ll-section-muted">
          <div className="ll-container ll-detail-layout">
            <div>
              <ImageGallery images={property.gallery} title={property.title} />

              <div className="ll-key-specs-box tabular-nums">
                <div className="ll-key-spec-cell">
                  <div className="ll-key-spec-label">Property Type</div>
                  <div className="ll-key-spec-value">{property.propertyType}</div>
                </div>
                <div className="ll-key-spec-cell">
                  <div className="ll-key-spec-label">Bedrooms</div>
                  <div className="ll-key-spec-value">
                    {property.beds > 0 ? `${property.beds} Bedrooms` : 'Executive Floorplate'}
                  </div>
                </div>
                <div className="ll-key-spec-cell">
                  <div className="ll-key-spec-label">Bathrooms</div>
                  <div className="ll-key-spec-value">{property.baths} Bathrooms</div>
                </div>
                <div className="ll-key-spec-cell">
                  <div className="ll-key-spec-label">Built-Up Area</div>
                  <div className="ll-key-spec-value">{property.areaFormatted}</div>
                </div>
              </div>

              <div className="ll-form-card" style={{ marginBottom: '2rem' }}>
                <div className="ll-eyebrow">Property Dossier</div>
                <h2 className="ll-serif-title" style={{ fontSize: '1.55rem', marginBottom: '0.85rem' }}>
                  {property.subtitle}
                </h2>
                <p style={{ fontSize: '0.94rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                  {property.description}
                </p>

                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  Key Specifications &amp; Highlights
                </h3>
                <div className="ll-highlight-list">
                  {property.highlights.map((item) => (
                    <div key={item} className="ll-highlight-item">
                      <CheckIcon size={16} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {property.transactionType === 'BUY' && (
                <div>
                  <div className="ll-eyebrow">Financing Analysis</div>
                  <h2
                    className="ll-serif-title"
                    style={{ fontSize: '1.65rem', marginBottom: '1rem' }}
                  >
                    Estimate Mortgage for This Residence
                  </h2>
                  <MortgageCalculator
                    initialPrice={property.priceAed}
                    propertyTitle={property.title}
                    showPresets={false}
                  />
                </div>
              )}
            </div>

            <div style={{ position: 'sticky', top: '104px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h2 className="ll-serif-title" style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>
                  Arrange Private Viewing
                </h2>
                <p style={{ fontSize: '0.85rem' }}>
                  Speak directly with our advisory team regarding {property.refCode}.
                </p>
              </div>
              <ConsultationForm mode="PROPERTY_INQUIRY" contextTitle={property.title} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

