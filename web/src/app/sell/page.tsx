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
        {/* 1. Owners' header: the quick "List With Us" form is the first thing on the page */}
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
              <div className="ll-sell-arch">
                <ResponsiveImg
                  src="/images/residence-cedar-dusk.jpg"
                  sizes="(max-width: 960px) 1px, 34vw"
                  priority
                  alt=""
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. How we sell: one path from valuation to transfer */}
        <section className="ll-sell-method" aria-labelledby="sell-method">
          <div className="ll-container">
            <h2 id="sell-method" className="ll-sell-h2">
              How Leap Living Protects Asset Value
            </h2>
            <ol className="ll-sell-path">
              {PILLARS.map(({ icon: Icon, title, desc }) => (
                <li key={title}>
                  <span className="ll-sell-path-icon">
                    <Icon size={24} />
                  </span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 3. Schedule a briefing: Private Consultation first, Valuation from the valuation links */}
        <section id={VALUATION_ANCHOR} className="ll-sell-brief" aria-labelledby="sell-brief-title">
          <div className="ll-container ll-sell-brief-inner">
            <div className="ll-sell-brief-copy">
              <h2 id="sell-brief-title">Schedule a Briefing</h2>
              <p className="ll-sell-brief-lead">
                Select whether you are seeking a private consultation or an asset valuation.
              </p>
            </div>

            <div className="ll-sell-brief-box">
              <h3>Request a Free Property Valuation</h3>
              <p>
                Share your unit, villa, or land plot details to receive a comprehensive comparative
                pricing review and recommended exit strategy.
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
