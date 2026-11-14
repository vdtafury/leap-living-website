import Link from 'next/link'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ArrowUpRightIcon, ChevronRightIcon } from '@/components/ui/icons'
import { FULL_SERVICE_CATALOG } from '@/data/catalog'
import { DeveloperShowcase } from '@/components/home/developer-showcase'

export const metadata: Metadata = {
  title: 'About Us & Real Estate Consultancy | LEAP LIVING Dubai',
  description:
    'Leap Living brings over two decades of Dubai real estate leadership, independent Real Estate Consultancy, and institutional advisory.',
}

export default function AboutPage() {
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
                <span>About</span>
              </div>
              <div className="ll-eyebrow">Certainty Through Precision</div>
              <h1 className="ll-page-hero-title">Experience That Shapes Better Decisions</h1>
              <p className="ll-page-hero-desc">
                Leap Living is a real estate consultancy built on a simple belief: better decisions
                come from clarity and precision. In a market driven by pace and ambition, we bring
                focus, strategic depth, and a deliberate approach to every opportunity.
              </p>
            </div>

            <div className="ll-hero-media" style={{ height: '330px' }}>
              <ResponsiveImg
                src="/images/architecture-glass-towers.jpg"
                sizes="(max-width: 900px) 100vw, 50vw"
                priority
                alt="Dubai commercial glass towers"
                style={{ height: '330px' }}
              />
            </div>
          </div>
        </section>

        {/* Brand Philosophy, Vision & Mission */}
        <section className="ll-section-light">
          <div className="ll-container">
            <div className="ll-cards-grid">
              <div className="ll-service-card">
                <div className="ll-service-num">Philosophy</div>
                <h2 className="ll-serif-title" style={{ fontSize: '1.35rem' }}>
                  Advisory Over Speculation
                </h2>
                <p className="ll-service-desc" style={{ fontSize: '0.88rem' }}>
                  We believe real estate decisions should never be rushed, influenced by noise, or
                  driven by uncertainty. As an independent consultancy, we operate as a trusted
                  partner rather than a conventional transactional brokerage.
                </p>
              </div>

              <div className="ll-service-card featured">
                <div className="ll-service-num">Mission</div>
                <h2 className="ll-serif-title" style={{ fontSize: '1.35rem' }}>
                  Informed Client Clarity
                </h2>
                <p className="ll-service-desc" style={{ fontSize: '0.88rem' }}>
                  To strengthen decision-making for property buyers and investors through
                  well-informed, experience-driven real estate advisory — grounded in strategic
                  thinking, market clarity, and long-term value rather than short-term opportunity.
                </p>
              </div>

              <div className="ll-service-card">
                <div className="ll-service-num">Vision</div>
                <h2 className="ll-serif-title" style={{ fontSize: '1.35rem' }}>
                  Disciplined Long-Term Value
                </h2>
                <p className="ll-service-desc" style={{ fontSize: '0.88rem' }}>
                  To be a globally respected real estate consultancy, recognized for its disciplined
                  approach, depth of experience, and consistent focus on long-term value creation
                  across cycles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Executive Leadership: Mohab Samak — CEO (Strictly CEO title only) */}
        <section id="leadership" className="ll-section-muted">
          <div className="ll-container">
            <div className="ll-leadership-panel">
              <div className="ll-leadership-emblem">
                <img
                  src="/brand/logo-horizontal-white.png"
                  alt="LEAP LIVING"
                  style={{ height: '34px', width: 'auto', alignSelf: 'flex-start' }}
                />
                <div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'var(--brand-teal-25)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Executive Profile
                  </div>
                  <div
                    className="ll-serif-title"
                    style={{ color: 'var(--white)', fontSize: '1.4rem', lineHeight: 1.3 }}
                  >
                    Mohab Samak
                  </div>
                  <div
                    style={{
                      color: 'var(--brand-teal-50)',
                      fontSize: '0.82rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    Chief Executive Officer
                  </div>
                </div>
                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.18)',
                    paddingTop: '0.85rem',
                    fontSize: '0.75rem',
                    color: 'var(--brand-teal-25)',
                  }}
                >
                  21+ Years UAE Real Estate Leadership (Since 2005)
                </div>
              </div>

              <div>
                <div className="ll-eyebrow">Leadership</div>
                <div className="ll-leadership-meta">
                  <span className="ll-leadership-name">Mohab Samak</span>
                  <span className="ll-leadership-title">CEO</span>
                </div>
                <p style={{ fontSize: '0.94rem', lineHeight: 1.75, marginBottom: '1rem' }}>
                  Since beginning his real estate career in Dubai in 2005, Mohab Samak has held
                  senior leadership and executive roles across prominent industry firms including
                  Emaar Properties, Hamptons International, Coldwell Banker, Engel &amp; Völkers
                  Dubai, D&amp;B Properties, and Metropolitan Premium Properties.
                </p>
                <p style={{ fontSize: '0.94rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                  His career spans large-scale residential and commercial master developments,
                  developer project commercialisation, private wealth mandates, and cross-cycle
                  advisory strategy.
                </p>
                <Link href="/contact" className="ll-btn ll-btn-primary">
                  <span>Request an Executive Consultation</span>
                  <ArrowUpRightIcon size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Full 9 Core Advisory Services including Consultancy */}
        <section id="services" className="ll-section-light">
          <div className="ll-container">
            <div className="ll-section-header">
              <div>
                <div className="ll-eyebrow">Advisory Capabilities</div>
                <h2 className="ll-serif-title ll-section-title">
                  Real Estate Consultancy &amp; Core Services
                </h2>
                <p className="ll-section-lead">
                  Full-spectrum client advisory engineered for private individuals, institutional
                  investors, family offices, and master developers.
                </p>
              </div>
            </div>

            <div className="ll-services-catalog-grid">
              {FULL_SERVICE_CATALOG.map((service, idx) => (
                <div
                  key={service.title}
                  className={`ll-service-card ${idx === 0 ? 'featured' : ''}`}
                >
                  <div className="ll-service-num">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</div>
                  <h3 className="ll-service-title">{service.title}</h3>
                  <p className="ll-service-desc" style={{ fontSize: '0.84rem' }}>
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer network (logo marquee) */}
        <DeveloperShowcase />
      </main>

      <SiteFooter />
    </>
  )
}
