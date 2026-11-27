import Link from 'next/link'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PropertyListingBrowser } from '@/components/property/property-listing-browser'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import {
  ArrowUpRightIcon,
  BuildingIcon,
  CalculatorIcon,
  ChevronRightIcon,
  HandshakeIcon,
} from '@/components/ui/icons'
import { listPublishedProperties } from '@/modules/listings'

export const metadata: Metadata = pageMetadata({
  title: 'Properties for Sale | LEAP LIVING Dubai',
  description:
    'Browse prime luxury villas, penthouses, and investment residences for sale across Dubai with institutional advisory by Leap Living.',
  path: '/buy',
})

/* Next steps after the list: each one opens a tool that already exists on the site. */
const PLAN_STEPS = [
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
        {/* Light editorial header (the homepage's language: dark title, teal second line). */}
        <section className="ll-lhero">
          <div className="ll-container ll-lhero-inner">
            <div className="ll-lhero-copy">
              <nav className="ll-lhero-crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRightIcon size={13} />
                <span aria-current="page">Buy</span>
              </nav>
              <h1 className="ll-lhero-title">
                Properties for sale
                <span>in Dubai.</span>
              </h1>
              <p className="ll-lhero-desc">
                Vetted homes, sky penthouses and new developments across Dubai&apos;s prime
                communities. Open any property for full details and to model your financing.
              </p>
              <nav className="ll-lhero-modes" aria-label="Browse properties">
                <span className="ll-lhero-mode-thumb" aria-hidden="true" />
                <Link href="/buy" className="ll-lhero-mode is-active" aria-current="page">
                  Buy
                </Link>
                <Link href="/rent" className="ll-lhero-mode">
                  Rent
                </Link>
              </nav>
            </div>

            {/* The brand keyhole, used as a window onto Dubai. Decorative. */}
            <div className="ll-lhero-visual" aria-hidden="true">
              <span className="ll-lhero-keyhole-line" />
              <div className="ll-lhero-keyhole">
                <ResponsiveImg src="/images/hero-villa-dusk.jpg" sizes="440px" priority />
              </div>
            </div>
          </div>
        </section>

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

        <section className="ll-lplan" aria-labelledby="ll-lplan-title">
          <div className="ll-container ll-lplan-inner">
            <div className="ll-lplan-head">
              <h2 id="ll-lplan-title" className="ll-serif-title ll-lplan-title">
                Plan your purchase
              </h2>
              <p className="ll-lplan-lead">Everything you need before you make an offer.</p>
            </div>
            <ul className="ll-lplan-list">
              {PLAN_STEPS.map(({ href, icon: Icon, title, text }) => (
                <li key={href}>
                  <Link href={href} className="ll-lplan-row">
                    <span className="ll-lplan-icon" aria-hidden="true">
                      <Icon size={22} />
                    </span>
                    <span className="ll-lplan-text">
                      <strong>{title}</strong>
                      <span>{text}</span>
                    </span>
                    <span className="ll-lplan-arrow" aria-hidden="true">
                      <ArrowUpRightIcon size={16} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
