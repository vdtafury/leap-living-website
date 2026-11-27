import Link from 'next/link'
import type { Metadata } from 'next'
import type { ComponentType } from 'react'
import { VALUATION_ANCHOR } from '@/lib/anchors'
import { pageMetadata } from '@/lib/seo'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ConsultationForm } from '@/components/forms/consultation-form'
import { ListWithUsForm } from '@/components/forms/list-with-us-form'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import {
  ArrowRightIcon,
  ChartUpIcon,
  CheckIcon,
  ChevronRightIcon,
  HandshakeIcon,
  LayersIcon,
} from '@/components/ui/icons'

export const metadata: Metadata = pageMetadata({
  title: 'Sell With Us & Free Property Valuation | LEAP LIVING Dubai',
  description:
    'Confidential valuation, strategic pricing, and discreet disposition advisory for Dubai property owners.',
  path: '/sell',
})

type Pillar = { icon: ComponentType<{ size?: number }>; title: string; desc: string }

const PILLARS: Pillar[] = [
  {
    icon: ChartUpIcon,
    title: 'Evidence-Based Valuation',
    desc: 'Benchmarking against verified Dubai Land Department transfer comparables, micro-location orientation, and scarcity.',
  },
  {
    icon: LayersIcon,
    title: 'Bespoke Asset Positioning',
    desc: 'Targeted preparation of architectural dossiers and discreet circulation among vetted private buyers and family offices.',
  },
  {
    icon: HandshakeIcon,
    title: 'Structured Negotiation & Transfer',
    desc: 'Principals-level negotiation oversight from Form F structuring through trustee office transfer and settlement.',
  },
]

/**
 * The value line (viewBox 1200 x 200): it passes through the centres of the three step markers,
 * which sit at x = 200 / 600 / 1000 (the column centres) and y = 158 / 118 / 44 (rising faster towards the transfer).
 */
const VALUE_LINE =
  'M0 176 C33.3 173 100 167.7 200 158 C300 148.3 466.7 137 600 118 C733.3 99 900 61.3 1000 44 C1100 26.7 1166.7 19 1200 14'

const VALUATION_POINTS = [
  'Senior valuation review directed by CEO Mohab Samak',
  'Comparative DLD transaction analysis by community & tower',
  'Confidential off-market option available upon request',
]

export default function SellPage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* 1. Owners' header: the quick "List With Us" form beside a light photo pair (D-60) */}
        <section className="ll-sell-hero" aria-labelledby="sell-title">
          <div className="ll-container ll-sell-hero-inner">
            <div className="ll-sell-hero-copy">
              <nav className="ll-sell-crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRightIcon size={13} />
                <span aria-current="page">Sell &amp; Free Valuation</span>
              </nav>
              <span className="ll-sell-tag">Property Owners</span>
              <h1 id="sell-title" className="ll-sell-title">
                Strategic Disposition <span>&amp; Free Valuation</span>
              </h1>
              <p className="ll-sell-desc">
                We position high-value Dubai properties with institutional clarity rather than
                mass-portal overexposure. Request a comparative market valuation grounded in
                recorded DLD transfers and active private buyer demand.
              </p>

              <div id="list-with-us" className="ll-sell-list">
                <ListWithUsForm
                  header={
                    <div className="ll-sell-list-head">
                      <h2>List With Us</h2>
                      <p>
                        Leave your name, number, and community and a senior consultant will call you
                        back directly.
                      </p>
                    </div>
                  }
                />
              </div>

              <a href={`#${VALUATION_ANCHOR}`} className="ll-sell-jump">
                <span>Request a Free Property Valuation</span>
                <ArrowRightIcon size={15} />
              </a>
            </div>

            <div className="ll-sell-hero-visual" aria-hidden="true">
              <div className="ll-sell-capsule">
                <ResponsiveImg
                  src="/images/property-palm-villa.jpg"
                  sizes="(max-width: 960px) 1px, 30vw"
                  priority
                  alt=""
                />
              </div>
              <div className="ll-sell-orb">
                <ResponsiveImg
                  src="/images/waterfront-pool-estate.jpg"
                  sizes="(max-width: 960px) 1px, 180px"
                  alt=""
                />
              </div>
              <div className="ll-sell-chip">
                <span className="ll-sell-chip-icon">
                  <CheckIcon size={14} />
                </span>
                <span>
                  <strong>Free Property Valuation</strong>
                  <small>Comparative DLD transaction analysis</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. How we sell: a value line that rises through the three steps and ends on the
            brand keyhole, where the keys change hands (D-61) */}
        <section className="ll-sell-method" aria-labelledby="sell-method">
          <div className="ll-container">
            <h2 id="sell-method" className="ll-sell-h2">
              How Leap Living Protects Asset Value
            </h2>
            <div className="ll-sell-value">
              <svg
                className="ll-sell-value-chart"
                viewBox="0 0 1200 200"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  <linearGradient id="ll-sell-value-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
                    <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className="ll-sell-value-base" d="M0 176 H1200" />
                <path className="ll-sell-value-area" d={`${VALUE_LINE} V200 H0 Z`} />
                <path className="ll-sell-value-line" d={VALUE_LINE} pathLength={1} />
              </svg>
              <ol className="ll-sell-path">
                {PILLARS.map(({ icon: Icon, title, desc }, index) => (
                  <li key={title}>
                    <span className="ll-sell-path-icon">
                      {index === PILLARS.length - 1 ? (
                        <span className="ll-sell-path-keyhole" />
                      ) : (
                        <Icon size={24} />
                      )}
                    </span>
                    <div className="ll-sell-path-text">
                      <h3>{title}</h3>
                      <p>{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 3. Schedule a briefing: two equal panels, details | form (D-60) */}
        <section id={VALUATION_ANCHOR} className="ll-sell-brief" aria-labelledby="sell-brief-title">
          <div className="ll-container ll-sell-brief-inner">
            <div className="ll-sell-brief-panel">
              <div className="ll-sell-brief-copy">
                <h2 id="sell-brief-title">Schedule a Briefing</h2>
                <p className="ll-sell-brief-lead">
                  Select whether you are seeking a private consultation or an asset valuation.
                </p>
              </div>

              <div className="ll-sell-brief-box">
                <h3>Request a Free Property Valuation</h3>
                <p>
                  Share your unit, villa, or land plot details to receive a comprehensive
                  comparative pricing review and recommended exit strategy.
                </p>
                <ul>
                  {VALUATION_POINTS.map((point) => (
                    <li key={point}>
                      <span className="ll-sell-brief-check">
                        <CheckIcon size={13} />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="ll-sell-brief-form">
              <ConsultationForm mode="CONSULTATION" darkSurface />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
