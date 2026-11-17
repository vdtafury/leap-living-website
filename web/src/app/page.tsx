import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { HeroSearchBar } from '@/components/home/hero-search-bar'
import { HomeMortgageCalculator } from '@/components/home/home-mortgage-calculator'
import { HeroVideoBackdrop } from '@/components/home/hero-video-backdrop'
import { PropertyCarousel } from '@/components/property/property-carousel'
import { ProjectCard } from '@/components/project/project-card'
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  HomeIcon,
  ShieldCheckIcon,
  StackIcon,
  UsersIcon,
} from '@/components/ui/icons'
import { DeveloperShowcase } from '@/components/home/developer-showcase'
import { ClientExperience } from '@/components/home/client-experience'
import { CORE_SERVICES, PROJECTS, PROPERTIES } from '@/data/catalog'
import { HERO_VIDEO_SRC } from '@/lib/hero-video'
import { OrganizationJsonLd } from '@/components/seo/organization-json-ld'

// The client's hero video is git-ignored (over GitHub's 100 MB limit), so it only exists where it
// was placed with scripts/prepare-hero-original.sh. Checked once, at build time.
const hasHeroVideo = fs.existsSync(
  path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', HERO_VIDEO_SRC),
)

export default function HomePage() {
  // Communities offered by the hero search, per mode, straight from the catalogue.
  const uniqueSorted = (list: string[]) => Array.from(new Set(list)).sort()
  const communitiesWhere = (match: (p: (typeof PROPERTIES)[number]) => boolean) =>
    uniqueSorted(PROPERTIES.filter(match).map((p) => p.community))
  // Commercial listings are included in Buy/Rent (no separate Commercial tab).
  const searchCommunities = {
    BUY: communitiesWhere((p) => p.transactionType === 'BUY'),
    RENT: communitiesWhere((p) => p.transactionType === 'RENT'),
  }
  const featuredSaleProperties = PROPERTIES.filter(
    (item) => item.transactionType === 'BUY' && item.featured,
  )

  return (
    <>
      <OrganizationJsonLd />
      <SiteHeader />

      <main>
        {/* ==================== CINEMATIC HERO ==================== */}
        <section className="ll-hero">
          <HeroVideoBackdrop hasVideo={hasHeroVideo} />

          <div className="ll-container ll-hero-inner">
            <div className="ll-hero-content">
              <h1 className="ll-hero-title">
                Unlock your
                <span>next move.</span>
              </h1>
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
        <DeveloperShowcase />

        {/* ==================== INSTITUTIONAL PILLARS ==================== */}
        <section className="ll-stats-section ll-defer-render" aria-label="Institutional Pillars">
          <div className="ll-container">
            <div className="ll-stats-grid">
              <div className="ll-stat-item">
                <span className="ll-stat-icon">
                  <CalendarIcon size={28} />
                </span>
                <div className="ll-stat-value">21+ Years</div>
                <p className="ll-stat-desc">
                  Executive leadership across Dubai&apos;s residential and commercial cycles since
                  2005.
                </p>
              </div>
              <div className="ll-stat-item">
                <span className="ll-stat-icon">
                  <StackIcon size={28} />
                </span>
                <div className="ll-stat-value">AED 12B+</div>
                <p className="ll-stat-desc">
                  Commercialisation, pricing strategy, and landmark project stewardship across the
                  UAE.
                </p>
              </div>
              <div className="ll-stat-item">
                <span className="ll-stat-icon">
                  <ShieldCheckIcon size={28} />
                </span>
                <div className="ll-stat-value">100% Fiduciary</div>
                <p className="ll-stat-desc">
                  Client-aligned counsel structured around long-term value over short-term brokerage
                  volume.
                </p>
              </div>
              <div className="ll-stat-item">
                <span className="ll-stat-icon">
                  <UsersIcon size={28} />
                </span>
                <div className="ll-stat-value">Direct Access</div>
                <p className="ll-stat-desc">
                  Executive relationships across Tier-1 master developers, family offices, and
                  private owners.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FEATURED BUY PORTFOLIO PREVIEW ==================== */}
        <section className="ll-section-light ll-defer-render">
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
              <h2 className="ll-serif-title ll-section-title">Featured Properties for Sale</h2>
            </PropertyCarousel>
          </div>
        </section>

        {/* ==================== SERVICES OVERVIEW (WITH CONSULTANCY) ==================== */}
        <section className="ll-section-tint ll-defer-render">
          <div className="ll-container">
            <div className="ll-section-header">
              <h2 className="ll-serif-title ll-section-title">End-to-End Real Estate Advisory</h2>
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
        <section className="ll-section-plain ll-defer-render">
          <div className="ll-container">
            <div className="ll-section-header">
              <h2 className="ll-serif-title ll-section-title">Selected Real Estate Projects</h2>
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

        {/* ==================== VALUATION & MORTGAGE (one card: owners | buyers) ==================== */}
        <section className="ll-section-tint ll-defer-render" aria-labelledby="ll-advice-title">
          <div className="ll-container">
            <div className="ll-advice">
              {/* Owners: section title + valuation request */}
              <div className="ll-advice-owners">
                <div className="ll-eyebrow">Owner &amp; Buyer Advisory</div>
                <h2 id="ll-advice-title" className="ll-serif-title ll-section-title">
                  Free Property Valuation &amp; Mortgage Planning
                </h2>

                <div className="ll-advice-valuation">
                  <div className="ll-advice-kicker">
                    <span className="ll-advice-icon" aria-hidden="true">
                      <HomeIcon size={18} />
                    </span>
                    For Owners
                  </div>
                  <h3 className="ll-advice-subtitle">What is your property worth?</h3>
                  <p className="ll-advice-text">
                    A free, no-obligation valuation based on recent transactions in your community.
                  </p>
                  <Link href="/sell#valuation-form" className="ll-btn ll-btn-primary ll-advice-btn">
                    <span>Request Free Valuation</span>
                    <ArrowUpRightIcon size={15} />
                  </Link>
                </div>
              </div>

              {/* Buyers: the calculator (navbar "Mortgage Calculator" scrolls here, D-30) */}
              <HomeMortgageCalculator />
            </div>
          </div>
        </section>

        {/* ==================== CLIENT PERSPECTIVES ==================== */}
        <ClientExperience />
      </main>

      <SiteFooter />
    </>
  )
}
