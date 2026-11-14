import Link from 'next/link'
import { prisma } from '@/server/db'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { HeroSearchBar } from '@/components/home/hero-search-bar'
import { HeroVideoBackdrop } from '@/components/home/hero-video-backdrop'
import { PropertyCarousel } from '@/components/property/property-carousel'
import { ProjectCard } from '@/components/project/project-card'
import { ArrowRightIcon, ArrowUpRightIcon } from '@/components/ui/icons'
import { KeyholeMark } from '@/components/ui/keyhole-mark'
import { DeveloperShowcase } from '@/components/home/developer-showcase'
import {
  CLIENT_PERSPECTIVES,
  CORE_SERVICES,
  PROJECTS,
  PROPERTIES,
} from '@/data/catalog'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const mediaAssetCount = await prisma.mediaAsset.count()

  // Communities offered by the hero search, per mode, straight from the catalogue.
  const uniqueSorted = (list: string[]) => Array.from(new Set(list)).sort()
  const communitiesWhere = (match: (p: (typeof PROPERTIES)[number]) => boolean) =>
    uniqueSorted(PROPERTIES.filter(match).map((p) => p.community))
  const searchCommunities = {
    BUY: communitiesWhere((p) => p.transactionType === 'BUY' && p.propertyType !== 'Commercial'),
    RENT: communitiesWhere((p) => p.transactionType === 'RENT' && p.propertyType !== 'Commercial'),
    COMMERCIAL: communitiesWhere((p) => p.propertyType === 'Commercial'),
  }
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

          <div className="ll-container ll-hero-inner">
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

            {/* Integrated search lives inside the hero */}
            <HeroSearchBar communities={searchCommunities} />
          </div>
        </section>

        {/* ==================== DEVELOPER NETWORK (logo marquee) ==================== */}
        <DeveloperShowcase index="01" />

        {/* ==================== FEATURED BUY PORTFOLIO PREVIEW ==================== */}
        <section className="ll-section-light">
          <div className="ll-container">
            <PropertyCarousel
              items={featuredSaleProperties}
              label="Featured properties for sale"
              action={
                <Link href="/buy" className="ll-link-arrow">
                  <span className="ll-label-long">View All Properties for Sale</span>
                  <span className="ll-label-short" aria-hidden="true">
                    View all
                  </span>
                  <ArrowUpRightIcon size={15} />
                </Link>
              }
            >
              <div className="ll-eyebrow">
                <span className="ll-eyebrow-num">02</span>Curated Portfolio
              </div>
              <h2 className="ll-serif-title ll-section-title">Featured Properties for Sale</h2>
              <p className="ll-section-lead">
                Representative residences across Dubai&apos;s most sought-after addresses, from
                Palm Jumeirah and Downtown to Jumeirah Bay Island. Use the arrows to browse, then
                select any mandate for full specifications and financing analysis.
              </p>
            </PropertyCarousel>
          </div>
        </section>

        {/* ==================== SERVICES OVERVIEW (WITH CONSULTANCY) ==================== */}
        <section className="ll-section-gradient">
          <KeyholeMark className="ll-keyhole ll-keyhole-services" strokeWidth={1.6} />
          <div className="ll-container">
            <div className="ll-section-header">
              <div>
                <div className="ll-eyebrow">
                  <span className="ll-eyebrow-num">03</span>Advisory Scope
                </div>
                <h2 className="ll-serif-title ll-section-title">End-to-End Real Estate Advisory</h2>
                <p className="ll-section-lead">
                  Led by independent Real Estate Consultancy, our practice supports acquisition,
                  leasing, investment structuring, development evaluation, and confidential exits.
                </p>
              </div>
              <Link href="/about#services" className="ll-link-arrow">
                <span>Explore Full Service Scope</span>
                <ArrowUpRightIcon size={15} />
              </Link>
            </div>

            <div className="ll-services-bento">
              {CORE_SERVICES.map((service, index) => (
                <div
                  key={service.id}
                  className={`ll-service-tile ${service.featured ? 'featured' : ''}`}
                >
                  {service.featured && (
                    <KeyholeMark className="ll-keyhole ll-keyhole-tile" strokeWidth={1.8} />
                  )}
                  <div className="ll-service-bignum" aria-hidden="true">
                    0{index + 1}
                  </div>
                  <div className="ll-service-tile-body">
                    {service.featured && service.tag && (
                      <span className="ll-chip ll-chip-light">{service.tag}</span>
                    )}
                    <h3 className="ll-service-tile-title">{service.title}</h3>
                    <p className="ll-service-tile-desc">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SIGNATURE PROJECTS PREVIEW ==================== */}
        <section className="ll-section-grey">
          <KeyholeMark className="ll-keyhole ll-keyhole-grey" strokeWidth={1.6} />
          <div className="ll-container">
            <div className="ll-section-header">
              <div>
                <div className="ll-eyebrow">
                  <span className="ll-eyebrow-num">04</span>Dubai Developments
                </div>
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
        <section className="ll-section-image">
          <div className="ll-section-image-bg" aria-hidden="true">
            <img src="/images/architecture-glass-towers.jpg" alt="" loading="lazy" />
            <span className="ll-section-image-scrim" />
          </div>
          <div className="ll-container">
            <div className="ll-leadership-glass">
              <div className="ll-leadership-emblem-card">
                <KeyholeMark className="ll-keyhole ll-keyhole-emblem" strokeWidth={1.8} />
                <img
                  src="/brand/logo-horizontal-white.png"
                  alt="LEAP LIVING"
                  className="ll-leadership-emblem-logo"
                />
                <div>
                  <div className="ll-leadership-emblem-kicker">Institutional Leadership</div>
                  <div className="ll-serif-title ll-leadership-emblem-title">
                    Two Decades Shaping Prime UAE Developments
                  </div>
                </div>
                <div className="ll-leadership-emblem-foot">
                  <span>Dubai · UAE</span>
                  <span>Since 2005</span>
                </div>
              </div>

              <div>
                <div className="ll-eyebrow">
                  <span className="ll-eyebrow-num">05</span>Executive Leadership
                </div>
                <blockquote className="ll-leadership-quote">
                  &ldquo;Informed decisions create exceptional outcomes. Every property decision
                  carries financial, strategic, and personal significance. Our responsibility
                  is to ensure clients have clarity and insight.&rdquo;
                </blockquote>

                <div className="ll-leadership-meta">
                  <span className="ll-leadership-name">Mohab Samak</span>
                  <span className="ll-leadership-title">CEO</span>
                </div>

                <p className="ll-section-lead ll-leadership-bio">
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
                  <Link href="/contact" className="ll-btn ll-btn-outline-light">
                    Request Executive Briefing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== DEDICATED TOOLS & VALUATION ENTRY BAND ==================== */}
        <section className="ll-section-teal">
          <KeyholeMark className="ll-keyhole ll-keyhole-teal-band" strokeWidth={1.6} />
          <div className="ll-container ll-cta-band">
            <div>
              <div className="ll-eyebrow">Owner &amp; Buyer Advisory</div>
              <h2 className="ll-serif-title ll-section-title">
                Free Property Valuation &amp; Mortgage Planning
              </h2>
              <p className="ll-section-lead">
                Whether benchmarking the market value of an existing Dubai asset prior to exit
                or structuring UAE bank financing prior to acquisition, our dedicated advisory
                pages provide direct analytical tools and senior consultation.
              </p>
            </div>

            <div className="ll-cta-band-actions">
              <Link href="/sell#valuation-form" className="ll-btn ll-btn-light">
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
        <section className="ll-section-muted">
          <div className="ll-container">
            <div className="ll-section-header">
              <div>
                <div className="ll-eyebrow">
                  <span className="ll-eyebrow-num">06</span>Client Perspectives
                </div>
                <h2 className="ll-serif-title ll-section-title">Private Client Experience</h2>
              </div>
              <Link href="/contact" className="ll-link-arrow">
                <span>Speak With an Advisor</span>
                <ArrowUpRightIcon size={15} />
              </Link>
            </div>

            <div className="ll-cards-grid">
              {CLIENT_PERSPECTIVES.map((item) => (
                <figure key={item.author} className="ll-quote-card">
                  <span className="ll-quote-mark" aria-hidden="true">
                    &ldquo;
                  </span>
                  <blockquote className="ll-quote-text">{item.quote}</blockquote>
                  <figcaption className="ll-quote-author">
                    <span className="ll-monogram" aria-hidden="true">
                      {item.initials}
                    </span>
                    <span>
                      <span className="ll-quote-name">{item.author}</span>
                      <span className="ll-quote-role">{item.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== INSTITUTIONAL PILLARS ==================== */}
        <section className="ll-stats-section" aria-label="Institutional Pillars">
          <KeyholeMark className="ll-keyhole ll-keyhole-stats" />
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
      </main>

      <SiteFooter />
    </>
  )
}
