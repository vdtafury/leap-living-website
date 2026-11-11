import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { MortgageCalculator } from '@/components/tools/mortgage-calculator'
import { ChevronRightIcon } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Dubai Mortgage Calculator | LEAP LIVING',
  description:
    'Interactive UAE mortgage repayment and Dubai Land Department (DLD) acquisition cost calculator.',
}

export default function MortgagePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="ll-page-hero">
          <div className="ll-container">
            <div className="ll-breadcrumbs">
              <Link href="/">Home</Link>
              <ChevronRightIcon size={13} />
              <span>Mortgage Calculator</span>
            </div>
            <div className="ll-eyebrow">Acquisition Planning</div>
            <h1 className="ll-page-hero-title">UAE Mortgage Calculator</h1>
            <p className="ll-page-hero-desc">
              Model monthly principal-and-interest repayments, Central Bank LTV brackets, and
              estimated Dubai Land Department (DLD) transfer charges prior to acquisition.
            </p>
          </div>
        </section>

        <section className="ll-section-muted">
          <div className="ll-container">
            <MortgageCalculator />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

