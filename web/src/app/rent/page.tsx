import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PropertyListingBrowser } from '@/components/property/property-listing-browser'
import { ListingsHero } from '@/components/listings/listings-hero'
import { ListingsPlan, type PlanStep } from '@/components/listings/listings-plan'
import { HandshakeIcon, HomeIcon, KeyIcon } from '@/components/ui/icons'
import { listPublishedProperties } from '@/modules/listings'

export const metadata: Metadata = pageMetadata({
  title: 'Properties for Rent | LEAP LIVING Dubai',
  description:
    'Residential and Grade-A commercial leasing across Dubai Marina, Jumeirah Islands, and DIFC curated by Leap Living.',
  path: '/rent',
})

/* For tenants first, then landlords: each link opens a page that already exists. */
const PLAN_STEPS: PlanStep[] = [
  {
    href: '/contact',
    icon: HandshakeIcon,
    title: 'Private consultation',
    text: 'Talk to an advisor about your area, budget and move-in date.',
  },
  {
    href: '/buy',
    icon: KeyIcon,
    title: 'Thinking of buying?',
    text: 'Compare with properties for sale and model a mortgage.',
  },
  {
    href: '/sell#list-with-us',
    icon: HomeIcon,
    title: 'Own a property to rent out?',
    text: 'List it with us: just your name, number and community.',
  },
]

export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<{
    community?: string
    type?: string
    beds?: string
    budget?: string
    sort?: string
  }>
}) {
  const params = await searchParams
  const rentalItems = await listPublishedProperties({ transactionType: 'RENT' })

  return (
    <>
      <SiteHeader />

      <main>
        <ListingsHero
          mode="RENT"
          title="Properties for rent"
          accent="in Dubai."
          description="Executive residences and Grade-A offices across Dubai, ready for long-term family or corporate tenancy. Open any property for full details."
          image="/images/dubai-marina-commercial.jpg"
        />

        <section className="ll-lb-section" aria-label="Properties for rent">
          <div className="ll-container">
            <PropertyListingBrowser
              mode="RENT"
              items={rentalItems}
              initialCommunity={params.community ?? 'ALL'}
              initialType={params.type ?? 'ALL'}
              initialBeds={params.beds ?? 'ALL'}
              initialBudget={params.budget ?? 'ALL'}
              initialSort={params.sort}
            />
          </div>
        </section>

        <ListingsPlan
          title="Plan your move"
          lead="Next steps for tenants, and for owners with a home to let."
          steps={PLAN_STEPS}
        />
      </main>

      <SiteFooter />
    </>
  )
}
