import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PropertyListingBrowser } from '@/components/property/property-listing-browser'
import { ListingsHero } from '@/components/listings/listings-hero'
import { ListingsPlan } from '@/components/listings/listings-plan'
import { CalculatorIcon } from '@/components/ui/icons'
import { listPublishedProjects, listPublishedProperties } from '@/modules/listings'

export const metadata: Metadata = pageMetadata({
  title: 'Properties for Sale | LEAP LIVING Dubai',
  description:
    'Browse prime luxury villas, penthouses, and investment residences for sale across Dubai with institutional advisory by Leap Living.',
  path: '/buy',
})

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
  const [saleItems, projects] = await Promise.all([
    listPublishedProperties({ transactionType: 'BUY' }),
    listPublishedProjects(),
  ])
  const projectCount = projects.length

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
          mode="BUY"
          title="Plan your purchase"
          lead="Everything you need before you make an offer."
          tool={{
            icon: CalculatorIcon,
            tag: 'Mortgage calculator',
            title: 'Estimate your monthly repayment in seconds.',
          }}
          feature={{
            href: '/projects',
            image: projects[0]?.heroImage || '/images/hero-palm-villas.jpg',
            imageAlt: projects[0] ? projects[0].title : 'Dubai villas on the water',
            title: 'New projects',
            text: 'Browse off-plan developments and their payment plans.',
            chip:
              projectCount > 0
                ? `${projectCount} ${projectCount === 1 ? 'development' : 'developments'}`
                : undefined,
          }}
          consultText="Talk to an advisor about your budget, area and timing."
        />
      </main>

      <SiteFooter />
    </>
  )
}
