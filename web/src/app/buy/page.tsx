import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PropertyListingBrowser } from '@/components/property/property-listing-browser'
import { ListingsHero } from '@/components/listings/listings-hero'
import { ListingsPlan, type PlanStep } from '@/components/listings/listings-plan'
import { BuildingIcon, CalculatorIcon, HandshakeIcon } from '@/components/ui/icons'
import { listPublishedProperties } from '@/modules/listings'

export const metadata: Metadata = pageMetadata({
  title: 'Properties for Sale | LEAP LIVING Dubai',
  description:
    'Browse prime luxury villas, penthouses, and investment residences for sale across Dubai with institutional advisory by Leap Living.',
  path: '/buy',
})

/* Next steps after the list: each one opens a tool that already exists on the site. */
const PLAN_STEPS: PlanStep[] = [
  {
    href: '/#mortgage-calculator',
    icon: CalculatorIcon,
    title: 'Mortgage calculator',
    text: 'Estimate your monthly repayment in seconds.',
  },
  {
    href: '/projects',
    icon: BuildingIcon,
    title: 'New projects',
    text: 'Browse off-plan developments and their payment plans.',
  },
  {
    href: '/contact',
    icon: HandshakeIcon,
    title: 'Private consultation',
    text: 'Talk to an advisor about your budget, area and timing.',
  },
]

export default async function BuyPage({
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
  const saleItems = await listPublishedProperties({ transactionType: 'BUY' })

  return (
    <>
      <SiteHeader />

      <main>
        <ListingsHero
          mode="BUY"
          title="Properties for sale"
          accent="in Dubai."
          description="Vetted homes, sky penthouses and new developments across Dubai's prime communities. Open any property for full details and to model your financing."
          image="/images/hero-villa-dusk.jpg"
        />

        <section className="ll-lb-section" aria-label="Properties for sale">
          <div className="ll-container">
            <PropertyListingBrowser
              mode="BUY"
              items={saleItems}
              initialCommunity={params.community ?? 'ALL'}
              initialType={params.type ?? 'ALL'}
              initialBeds={params.beds ?? 'ALL'}
              initialBudget={params.budget ?? 'ALL'}
              initialSort={params.sort}
            />
          </div>
        </section>

        <ListingsPlan
          title="Plan your purchase"
          lead="Everything you need before you make an offer."
          steps={PLAN_STEPS}
        />
      </main>

      <SiteFooter />
    </>
  )
}
