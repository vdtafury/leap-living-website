import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ConsultationForm } from '@/components/forms/consultation-form'
import { CheckIcon, ChevronRightIcon } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Sell With Us & Free Property Valuation | LEAP LIVING Dubai',
  description:
    'Confidential valuation, strategic pricing, and discreet disposition advisory for Dubai property owners.',
}

export default function SellPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="ll-page-hero">
          <div className="ll-container ll-two-col" style={{ gap: '3rem', alignItems: 'center' }}>
            <div>
              <div className="ll-breadcrumbs">
                <Link href="/">Home</Link>
                <ChevronRightIcon size={13} />
                <span>Sell &amp; Free Valuation</span>
              </div>
              <div className="ll-eyebrow">Property Owners</div>
              <h1 className="ll-page-hero-title">Strategic Disposition &amp; Free Valuation</h1>
              <p className="ll-page-hero-desc">
                We position high-value Dubai properties with institutional clarity rather than
                mass-portal overexposure. Request a comparative market valuation grounded in
                recorded DLD transfers and active private buyer demand.
              </p>
            </div>

            <div className="ll-hero-media" style={{ height: '320px' }}>
              <img
                src="/images/residence-cedar-dusk.jpg"
                alt="Architectural living space overlooking terrace"
                style={{ height: '320px' }}
              />
            </div>
          </div>
        </section>

        <section className="ll-section-light">
          <div className="ll-container">
            <div className="ll-eyebrow">Seller Methodology</div>
            <h2 className="ll-serif-title ll-section-title" style={{ marginBottom: '2rem' }}>
              How Leap Living Protects Asset Value
            </h2>

            <div className="ll-cards-grid">
              {[
                {
                  step: '01',
                  title: 'Evidence-Based Valuation',
                  desc: 'Benchmarking against verified Dubai Land Department transfer comparables, micro-location orientation, and scarcity.',
                },
                {
                  step: '02',
                  title: 'Bespoke Asset Positioning',
                  desc: 'Targeted preparation of architectural dossiers and discreet circulation among vetted private buyers and family offices.',
                },
                {
                  step: '03',
                  title: 'Structured Negotiation & Transfer',
                  desc: 'Principals-level negotiation oversight from Form F structuring through trustee office transfer and settlement.',
                },
              ].map((pillar) => (
                <div key={pillar.step} className="ll-service-card">
                  <div className="ll-service-num">{pillar.step}</div>
                  <h3 className="ll-service-title">{pillar.title}</h3>
                  <p className="ll-service-desc">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="valuation-form" className="ll-section-dark">
          <div className="ll-container ll-detail-layout" style={{ alignItems: 'center' }}>
            <div>
              <div className="ll-eyebrow ll-eyebrow-light">Confidential Valuation</div>
              <h2
                className="ll-serif-title ll-section-title"
                style={{ color: 'var(--white)', marginBottom: '1rem' }}
              >
                Request a Free Property Valuation
              </h2>
              <p
                style={{
                  color: 'var(--brand-teal-25)',
                  fontSize: '0.94rem',
                  lineHeight: 1.72,
                  marginBottom: '1.5rem',
                }}
              >
                Share your unit, villa, or land plot details to receive a comprehensive
                comparative pricing review and recommended exit strategy.
              </p>

              <div className="ll-highlight-list">
                {[
                  'Senior valuation review directed by CEO Mohab Samak',
                  'Comparative DLD transaction analysis by community & tower',
                  'Confidential off-market option available upon request',
                ].map((point) => (
                  <div key={point} className="ll-highlight-item" style={{ color: 'var(--white)' }}>
                    <CheckIcon size={16} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <ConsultationForm mode="VALUATION" darkSurface />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
