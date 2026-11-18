import Link from 'next/link'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { HeroSearchBar } from '@/components/home/hero-search-bar'
import { MortgageCalculator } from '@/components/tools/mortgage-calculator'
import { HeroVideoBackdrop } from '@/components/home/hero-video-backdrop'
import { PropertyCarousel } from '@/components/property/property-carousel'
import { ProjectPanels } from '@/components/home/project-panels'
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
import type { DeveloperBrand, ProjectItem, PropertyListing } from '@/data/catalog'
import type { HomeContent } from '@/data/content-defaults'
import {
  EMPTY_REVIEW_STATS,
  homepageReviews,
  type HomepageReview,
  type ReviewStats,
} from '@/modules/reviews'
import type { ReactNode } from 'react'

export interface HomeViewProps {
  content: HomeContent
  /** All published listings (the hero search offers their communities) */
  properties: PropertyListing[]
  /** Published projects marked Featured */
  projects: ProjectItem[]
  developers: DeveloperBrand[]
  hasHeroVideo: boolean
  /** JSON-LD needs the published settings; the admin preview leaves it out */
  jsonLd?: ReactNode
  /** Approved client reviews (D-44); the sample reviews from the CMS fill in until there are 3 */
  publishedReviews?: { items: HomepageReview[]; stats: ReviewStats }
}

/**
 * The homepage markup, fed with published content by app/page.tsx and with the draft by the
 * admin preview (/admin/content/home/preview). Layout and styling are fixed; only the words,
 * figures, lists and the listings shown come from the CMS.
 */
export function HomeView({
  content,
  properties,
  projects,
  developers,
  hasHeroVideo,
  jsonLd,
  publishedReviews = { items: [], stats: EMPTY_REVIEW_STATS },
}: HomeViewProps) {
  const { hero, stats, featured, services, advice, calculator, reviews } = content
  // Communities offered by the hero search, per mode, straight from the listings.
  const uniqueSorted = (list: string[]) => Array.from(new Set(list)).sort()
  const communitiesWhere = (match: (p: PropertyListing) => boolean) =>
    uniqueSorted(properties.filter(match).map((p) => p.community))
  // Commercial listings are included in Buy/Rent (no separate Commercial tab).
  const searchCommunities = {
    BUY: communitiesWhere((p) => p.transactionType === 'BUY'),
    RENT: communitiesWhere((p) => p.transactionType === 'RENT'),
  }
  const featuredSaleProperties = properties.filter(
    (item) => item.transactionType === 'BUY' && item.featured,
  )
  const STAT_ICONS = [CalendarIcon, StackIcon, ShieldCheckIcon, UsersIcon]

  return (
    <>
      {jsonLd}
      <SiteHeader />

      <main>
        {/* ==================== CINEMATIC HERO ==================== */}
        <section className="ll-hero">
          <HeroVideoBackdrop hasVideo={hasHeroVideo} />

          <div className="ll-container ll-hero-inner">
            <div className="ll-hero-content">
              <h1 className="ll-hero-title">
                {hero.titleLine1}
                <span>{hero.titleLine2}</span>
              </h1>
              <div className="ll-hero-ctas">
                <Link href={hero.primaryCta.href} className="ll-btn ll-btn-primary">
                  <span>{hero.primaryCta.label}</span>
                  <ArrowRightIcon size={15} />
                </Link>
                <Link href={hero.secondaryCta.href} className="ll-btn ll-btn-outline-light">
                  {hero.secondaryCta.label}
                </Link>
              </div>
            </div>

            {/* Integrated search lives inside the hero */}
            <HeroSearchBar communities={searchCommunities} />
          </div>
        </section>

        {/* ==================== DEVELOPER NETWORK (logo marquee) ==================== */}
        <DeveloperShowcase brands={developers} />

        {/* ==================== INSTITUTIONAL PILLARS ==================== */}
        <section className="ll-stats-section ll-defer-render" aria-label="Institutional Pillars">
          <div className="ll-container">
            <div className="ll-stats-grid">
              {stats.items.map((item, index) => {
                const Icon = STAT_ICONS[index % STAT_ICONS.length]
                return (
                  <div key={`${item.value}-${index}`} className="ll-stat-item">
                    <span className="ll-stat-icon">
                      <Icon size={28} />
                    </span>
                    <div className="ll-stat-value">{item.value}</div>
                    <p className="ll-stat-desc">{item.description}</p>
                  </div>
                )
              })}
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
                  <span className="ll-label-long">{featured.linkLabel}</span>
                  <span className="ll-label-short" aria-hidden="true">
                    View all
                  </span>
                  <ArrowUpRightIcon size={15} />
                </Link>
              }
            >
              <h2 className="ll-serif-title ll-section-title">{featured.title}</h2>
            </PropertyCarousel>
          </div>
        </section>

        {/* ==================== SERVICES OVERVIEW (WITH CONSULTANCY) ==================== */}
        <section className="ll-section-tint ll-defer-render">
          <div className="ll-container">
            <div className="ll-section-header">
              <h2 className="ll-serif-title ll-section-title">{services.title}</h2>
              <Link href={services.linkHref} className="ll-link-arrow">
                <span>{services.linkLabel}</span>
                <ArrowUpRightIcon size={15} />
              </Link>
            </div>

            <div className="ll-services-bento">
              {services.items.map((service, index) => (
                <div
                  key={`${service.title}-${index}`}
                  className={`ll-service-tile ${service.featured ? 'featured' : ''}`}
                >
                  <div className="ll-service-bignum" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
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
              <h2 className="ll-serif-title ll-section-title">{content.projects.title}</h2>
              <Link href="/projects" className="ll-link-arrow">
                <span>{content.projects.linkLabel}</span>
                <ArrowUpRightIcon size={15} />
              </Link>
            </div>

            {/* Expanding photo panels: unlike the property cards above (owner, 2026-11-18) */}
            <ProjectPanels projects={projects} developers={developers} />
          </div>
        </section>

        {/* ==================== VALUATION & MORTGAGE (one card: owners | buyers) ==================== */}
        <section className="ll-section-tint ll-defer-render" aria-labelledby="ll-advice-title">
          <div className="ll-container">
            <div className="ll-advice">
              {/* Owners: section title + valuation request */}
              <div className="ll-advice-owners">
                <div className="ll-eyebrow">{advice.eyebrow}</div>
                <h2 id="ll-advice-title" className="ll-serif-title ll-section-title">
                  {advice.title}
                </h2>

                <div className="ll-advice-valuation">
                  <div className="ll-advice-kicker">
                    <span className="ll-advice-icon" aria-hidden="true">
                      <HomeIcon size={18} />
                    </span>
                    {advice.ownersLabel}
                  </div>
                  <h3 className="ll-advice-subtitle">{advice.ownersTitle}</h3>
                  <p className="ll-advice-text">{advice.ownersText}</p>
                  <Link href={advice.ctaHref} className="ll-btn ll-btn-primary ll-advice-btn">
                    <span>{advice.ctaLabel}</span>
                    <ArrowUpRightIcon size={15} />
                  </Link>
                </div>
              </div>

              {/* Buyers: the calculator (navbar "Mortgage Calculator" scrolls here, D-30) */}
              <MortgageCalculator
                initialPrice={calculator.price}
                defaults={{
                  downPaymentPercent: calculator.downPaymentPercent,
                  interestRate: calculator.interestRate,
                  years: calculator.years,
                }}
              />
            </div>
          </div>
        </section>

        {/* ==================== CLIENT PERSPECTIVES ==================== */}
        <ClientExperience
          title={reviews.title}
          linkLabel={reviews.linkLabel}
          linkHref={reviews.linkHref}
          {...homepageReviews(publishedReviews.items, reviews.items, publishedReviews.stats)}
        />
      </main>

      <SiteFooter />
    </>
  )
}
