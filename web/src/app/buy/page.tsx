import Link from 'next/link'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PropertyListingBrowser } from '@/components/property/property-listing-browser'
import { ChevronRightIcon } from '@/components/ui/icons'
import { listPublishedProperties } from '@/modules/listings'

export const metadata: Metadata = pageMetadata({
  title: 'Properties for Sale | LEAP LIVING Dubai',
  description:
    'Browse prime luxury villas, penthouses, and investment residences for sale across Dubai with institutional advisory by Leap Living.',
  path: '/buy',
})

export default async function BuyPage({
  searchParams,
}: {
  searchParams: Promise<{ community?: string; type?: string; beds?: string; budget?: string }>
}) {
  const params = await searchParams
  const saleItems = await listPublishedProperties({ transactionType: 'BUY' })

  return (
    <>
      <SiteHeader />

      <main>
        <section className="ll-page-hero">
          <div className="ll-container">
            <div className="ll-breadcrumbs">
              <Link href="/">Home</Link>
              <ChevronRightIcon size={13} />
              <span>Buy</span>
            </div>
            <div className="ll-eyebrow">Acquisition Portfolio</div>
            <h1 className="ll-page-hero-title">Properties for Sale in Dubai</h1>
            <p className="ll-page-hero-desc">
              Vetted residential estates, sky penthouses, and primary development opportunities
              across Dubai&apos;s established prime districts. Click any property to inspect full
              specifications and model your financing.
            </p>
          </div>
        </section>

        <section className="ll-section-muted">
          <div className="ll-container">
            <PropertyListingBrowser
              mode="BUY"
              items={saleItems}
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
