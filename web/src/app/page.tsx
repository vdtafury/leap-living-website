import Link from 'next/link'
import { prisma } from '@/server/db'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { HeroSearchBar } from '@/components/home/hero-search-bar'
import { HeroVideoBackdrop } from '@/components/home/hero-video-backdrop'
import { PropertyCard } from '@/components/property/property-card'
import { ProjectCard } from '@/components/project/project-card'
import { ArrowRightIcon, ArrowUpRightIcon } from '@/components/ui/icons'
import {
  CLIENT_PERSPECTIVES,
  CORE_SERVICES,
  DEVELOPERS,
  PROJECTS,
  PROPERTIES,
} from '@/data/catalog'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const mediaAssetCount = await prisma.mediaAsset.count()
  const featuredSaleProperties = PROPERTIES.filter(
    (item) => item.transactionType === 'BUY' && item.featured,
  )

  return (
    <>
      <span style={{ display: 'none' }} aria-hidden="true">
        LEAP LIVING — Platform Ready (DB assets: {mediaAssetCount})
      </span>

      <SiteHeader />

      <main>
        {/* ==================== CINEMATIC HERO ==================== */}
        <section className="ll-hero">
          <HeroVideoBackdrop />

          <div className="ll-container ll-hero-grid">
            <div className="ll-hero-content">
              <div className="ll-eyebrow ll-eyebrow-light">CERTAINTY THROUGH PRECISION</div>
              <h1 className="ll-hero-title">
                Unlock your
                <span>next move.</span>
              </h1>
              <p className="ll-hero-desc">
                In a market driven by noise and speculation, Leap Living brings institutional
                clarity, strategic foresight, and over two decades of Dubai real estate
                leadership to high-value property decisions.
              </p>
              <div className="ll-hero-ctas">
                <Link href="/buy" className="ll-btn ll-btn-primary">
                  <span>Explore Properties</span>
                  <ArrowRightIcon size={15} />
                </Link>
                <Link href="/about" className="ll-btn ll-btn-outline-light">
                  Our Approach
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== INTEGRATED MULTI-PAGE SEARCH ==================== */}
        <HeroSearchBar />

        {/* ==================== INSTITUTIONAL PILLARS ==================== */}
        <section className="ll-stats-section" aria-label="Institutional Pillars">
          <div className="ll-container">
            <div className="ll-stats-grid">
              <div className="ll-stat-item">
                <div className="ll-stat-value">21+ Years</div>
                <p className="ll-stat-desc">
                  Executive leadership across Dubai&apos;s residential and commercial cycles since 2005.
                </p>
              </div>
              <div className="ll-stat-item">
                <div className="ll-stat-value">AED 12B+</div>
                <p className="ll-stat-desc">
                  Commercialisation, pricing strategy, and landmark project stewardship across the UAE.
                </p>
              </div>
              <div className="ll-stat-item">
                <div className="ll-stat-value">100% Fiduciary</div>
                <p className="ll-stat-desc">
                  Client-aligned counsel structured around long-term value over short-term brokerage volume.
                </p>
              </div>
              <div className="ll-stat-item">
                <div className="ll-stat-value">Direct Access</div>
                <p className="ll-stat-desc">
                  Executive relationships across Tier-1 master developers, family offices, and private owners.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FEATURED BUY PORTFOLIO PREVIEW ==================== */}
        <section className="ll-section-light">
          <div className="ll-container">
            <div className="ll-section-header">
              <div>
                <div className="ll-eyebrow">Curated Portfolio</div>
                <h2 className="ll-serif-title ll-section-title">Featured Properties for Sale</h2>
                <p className="ll-section-lead">
                  Representative architectural residences across Palm Jumeirah, Downtown Dubai,
                  and Dubai Hills Estate. Select any mandate for full specifications and financing analysis.
                </p>
              </div>
              <Link href="/buy" className="ll-link-arrow">
                <span>View All Properties for Sale</span>
                <ArrowUpRightIcon size={15} />
              </Link>
            </div>

            <div className="ll-cards-grid">
              {featuredSaleProperties.map((property) => (
                <PropertyCard key={property.slug} property={property} />
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SERVICES OVERVIEW (WITH CONSULTANCY) ==================== */}
        <section className="ll-section-muted">
          <div className="ll-container ll-services-layout">
            <div>
              <div className="ll-eyebrow">Advisory Scope</div>
              <h2 className="ll-serif-title ll-section-title" style={{ marginBottom: '0.85rem' }}>
                End-to-End Real Estate Advisory
              </h2>
              <p className="ll-section-lead" style={{ marginBottom: '1.5rem' }}>
                Led by independent Real Estate Consultancy, our practice supports acquisition,
                leasing, investment structuring, development evaluation, and confidential exits.
              </p>
              <Link href="/about#services" className="ll-btn ll-btn-outline">
                <span>Explore Full Service Scope</span>
                <ArrowUpRightIcon size={15} />
              </Link>
            </div>

            <div className="ll-services-grid">
              {CORE_SERVICES.map((service, index) => (
                <div
                  key={service.id}
                  className={`ll-service-card ${service.featured ? 'featured' : ''}`}
                >
                  <div className="ll-service-num">0{index + 1}</div>
                  <h3 className="ll-service-title">{service.title}</h3>
                  <p className="ll-service-desc">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SIGNATURE PROJECTS PREVIEW ==================== */}
        <section className="ll-section-light">
          <div className="ll-container">
            <div className="ll-section-header">
              <div>
                <div className="ll-eyebrow">Dubai Developments</div>
                <h2 className="ll-serif-title ll-section-title">Selected Real Estate Projects</h2>
                <p className="ll-section-lead">
                  Institutional insight into upcoming master-planned waterfront and golfside
                  developments across Dubai.
                </p>
              </div>
              <Link href="/projects" className="ll-link-arrow">
                <span>Browse All Projects</span>
                <ArrowUpRightIcon size={15} />
              </Link>
            </div>

            <div className="ll-cards-grid">
              {PROJECTS.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>

        {/* ==================== EXECUTIVE LEADERSHIP (CEO ONLY, ZERO PEOPLE PHOTOS) ==================== */}
        <section className="ll-section-muted">
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
                      marginBottom: '0.45rem',
                    }}
                  >
                    Institutional Leadership
                  </div>
                  <div
                    className="ll-serif-title"
                    style={{ color: 'var(--white)', fontSize: '1.35rem', lineHeight: 1.3 }}
                  >
                    Two Decades Shaping Prime UAE Developments
                  </div>
                </div>
                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.18)',
                    paddingTop: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: 'var(--brand-teal-25)',
                  }}
                >
                  <span>Dubai · UAE</span>
                  <span>Since 2005</span>
                </div>
              </div>

              <div>
                <div className="ll-eyebrow">Executive Leadership</div>
                <blockquote className="ll-leadership-quote">
                  &ldquo;Informed decisions create exceptional outcomes. Every property decision
                  carries financial, strategic, and personal significance. Our responsibility
                  is to ensure clients have clarity and insight.&rdquo;
                </blockquote>

                <div className="ll-leadership-meta">
                  <span className="ll-leadership-name">Mohab Samak</span>
                  <span className="ll-leadership-title">CEO</span>
                </div>

                <p className="ll-section-lead" style={{ marginBottom: '1.5rem' }}>
                  With over two decades of senior leadership across Emaar Properties, Hamptons
                  International, Coldwell Banker, Engel &amp; Völkers Dubai, D&amp;B Properties,
                  and Metropolitan Premium Properties, Mohab Samak directs Leap Living with an
                  emphasis on analytical precision over short-term sales volume.
                </p>

                <div className="ll-hero-ctas">
                  <Link href="/about" className="ll-btn ll-btn-primary">
                    <span>About Leap Living &amp; Leadership</span>
                    <ArrowUpRightIcon size={15} />
                  </Link>
                  <Link href="/contact" className="ll-btn ll-btn-outline">
                    Request Executive Briefing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== DEDICATED TOOLS & VALUATION ENTRY BAND ==================== */}
        <section className="ll-section-dark">
          <div className="ll-container ll-two-col" style={{ gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <div className="ll-eyebrow ll-eyebrow-light">Owner &amp; Buyer Advisory</div>
              <h2
                className="ll-serif-title ll-section-title"
                style={{ color: 'var(--white)', marginBottom: '0.85rem' }}
              >
                Free Property Valuation &amp; Mortgage Planning
              </h2>
              <p style={{ color: 'var(--brand-teal-25)', fontSize: '0.94rem', lineHeight: 1.7 }}>
                Whether benchmarking the market value of an existing Dubai asset prior to exit
                or structuring UAE bank financing prior to acquisition, our dedicated advisory
                pages provide direct analytical tools and senior consultation.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'flex-end' }}>
              <Link href="/sell#valuation-form" className="ll-btn ll-btn-primary">
                <span>Request Free Valuation</span>
                <ArrowUpRightIcon size={15} />
              </Link>
              <Link href="/mortgage" className="ll-btn ll-btn-outline-light">
                Open Mortgage Calculator
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== CLIENT PERSPECTIVES ==================== */}
        <section className="ll-section-light">
          <div className="ll-container">
            <div className="ll-section-header">
              <div>
                <div className="ll-eyebrow">Client Perspectives</div>
                <h2 className="ll-serif-title ll-section-title">Private Client Experience</h2>
              </div>
              <Link href="/contact" className="ll-link-arrow">
                <span>Speak With an Advisor</span>
                <ArrowUpRightIcon size={15} />
              </Link>
            </div>

            <div className="ll-cards-grid">
              {CLIENT_PERSPECTIVES.map((item) => (
                <div key={item.author} className="ll-testimonial-card">
                  <p className="ll-testimonial-quote">&ldquo;{item.quote}&rdquo;</p>
                  <div className="ll-testimonial-author-row">
                    <span className="ll-monogram" aria-hidden="true">
                      {item.initials}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--heading)' }}>
                        {item.author}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--body-text)' }}>
                        {item.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== DEVELOPERS TRUST BAR ==================== */}
        <section className="ll-section-muted" style={{ padding: '3rem 0' }}>
          <div className="ll-container">
            <div
              style={{
                textAlign: 'center',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--body-text)',
                marginBottom: '1.35rem',
              }}
            >
              Developers We Work With Across the UAE
            </div>
            <div className="ll-dev-grid">
              {DEVELOPERS.map((dev) => (
                <span key={dev} className="ll-dev-badge">
                  {dev}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
