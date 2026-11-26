import Link from 'next/link'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { HeroSearchBar } from '@/components/home/hero-search-bar'
import { MortgageCalculator } from '@/components/tools/mortgage-calculator'
import { HeroVideoBackdrop } from '@/components/home/hero-video-backdrop'
import { PropertyCarousel } from '@/components/property/property-carousel'
import { ProjectPanels } from '@/components/home/project-panels'
import { ServiceCards } from '@/components/home/service-cards'
import { ArrowRightIcon, ArrowUpRightIcon, HomeIcon } from '@/components/ui/icons'
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
// Homepage-only styles (D-49): this page and its admin preview, not the rest of the site.
import '@/styles/home/index.css'

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
  const { hero, featured, services, advice, calculator, reviews } = content
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

        {/* ==================== DEVELOPER NETWORK (logo marquee, below the fold, D-52) ====================
            The key-figures band that followed it was removed by the client (2026-11-19, D-52). */}
        <DeveloperShowcase brands={developers} />

        {/* ==================== FEATURED BUY PORTFOLIO PREVIEW ==================== */}
        <section className="ll-section-light ll-defer-render ll-carousel-bleed-host">
          <div className="ll-container">
            <PropertyCarousel
              items={featuredSaleProperties}
              label="Featured properties for sale"
              viewAll={{
                href: '/buy',
                label: featured.linkLabel,
                total: properties.filter((item) => item.transactionType === 'BUY').length,
              }}
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
            {/* Heading block + one card per service (D-48, owner's design) */}
            <ServiceCards {...services} />
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

        {/* ==================== VALUATION & MORTGAGE (D-51: heading, then one card) ====================
            Buyers first: the calculator, inputs | result panel (the footer link
            `/#mortgage-calculator` scrolls here, D-30; the navbar button became List Your Property, D-52). Owners last: the valuation request as the card's footer band. */}
        <section className="ll-section-tint ll-defer-render" aria-labelledby="ll-advice-title">
          <div className="ll-container">
            <div className="ll-advice-head">
              <div className="ll-eyebrow">{advice.eyebrow}</div>
              <h2 id="ll-advice-title" className="ll-serif-title ll-section-title">
                {advice.title}
              </h2>
            </div>

            <div className="ll-advice">
              <MortgageCalculator
                initialPrice={calculator.price}
                defaults={{
                  downPaymentPercent: calculator.downPaymentPercent,
                  interestRate: calculator.interestRate,
                  years: calculator.years,
                }}
              />

              <div className="ll-advice-owners">
                <span className="ll-advice-icon ll-advice-icon--lg" aria-hidden="true">
                  <HomeIcon size={22} />
                </span>
                <div className="ll-advice-owners-copy">
                  <div className="ll-advice-kicker">{advice.ownersLabel}</div>
                  <h3 className="ll-advice-subtitle">{advice.ownersTitle}</h3>
                  <p className="ll-advice-text">{advice.ownersText}</p>
                </div>
                <Link href={advice.ctaHref} className="ll-btn ll-btn-primary ll-advice-btn">
                  <span>{advice.ctaLabel}</span>
                  <ArrowUpRightIcon size={15} />
                </Link>
              </div>
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
