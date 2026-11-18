import Link from 'next/link'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PropertyListingBrowser } from '@/components/property/property-listing-browser'
import { ChevronRightIcon } from '@/components/ui/icons'
import { listPublishedProperties } from '@/modules/listings'

export const metadata: Metadata = pageMetadata({
  title: 'Properties for Rent | LEAP LIVING Dubai',
  description:
    'Residential and Grade-A commercial leasing across Dubai Marina, Jumeirah Islands, and DIFC curated by Leap Living.',
  path: '/rent',
})

export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<{ community?: string; type?: string; beds?: string; budget?: string }>
}) {
  const params = await searchParams
  const rentalItems = await listPublishedProperties({ transactionType: 'RENT' })

  return (
    <>
      <SiteHeader />

      <main>
        <section className="ll-page-hero">
          <div className="ll-container">
            <div className="ll-breadcrumbs">
              <Link href="/">Home</Link>
              <ChevronRightIcon size={13} />
              <span>Rent</span>
            </div>
            <div className="ll-eyebrow">Leasing &amp; Corporate Tenancies</div>
            <h1 className="ll-page-hero-title">Residential &amp; Commercial Leasing</h1>
            <p className="ll-page-hero-desc">
              Executive residences and Grade-A DIFC advisory offices prepared for immediate
              long-term corporate or family tenancy.
            </p>
          </div>
        </section>

        <section className="ll-section-muted">
          <div className="ll-container">
            <PropertyListingBrowser
              mode="RENT"
              items={rentalItems}
              initialCommunity={params.community ?? 'ALL'}
              initialType={params.type ?? 'ALL'}
              initialBeds={params.beds ?? 'ALL'}
              initialBudget={params.budget ?? 'ALL'}
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
