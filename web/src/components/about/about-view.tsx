import Link from 'next/link'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ArrowUpRightIcon, ChevronRightIcon } from '@/components/ui/icons'
import type { DeveloperBrand } from '@/data/catalog'
import type { AboutContent } from '@/data/content-defaults'
import { DeveloperShowcase } from '@/components/home/developer-showcase'

/** About page markup: published content (app/about/page.tsx) or the draft (admin preview). */
export function AboutView({
  content,
  developers,
}: {
  content: AboutContent
  developers: DeveloperBrand[]
}) {
  const { hero, pillars, leadership, services } = content
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
              <div className="ll-eyebrow">{hero.eyebrow}</div>
              <h1 className="ll-page-hero-title">{hero.title}</h1>
              <p className="ll-page-hero-desc">{hero.description}</p>
            </div>

            <div className="ll-hero-media" style={{ height: '330px' }}>
              <ResponsiveImg
                src="/images/architecture-glass-towers.jpg"
                sizes="(max-width: 900px) 100vw, 50vw"
                priority
                alt={hero.imageAlt}
                style={{ height: '330px' }}
              />
            </div>
          </div>
        </section>

        {/* Brand Philosophy, Vision & Mission */}
        <section className="ll-section-light">
          <div className="ll-container">
            <div className="ll-cards-grid">
              {pillars.items.map((pillar, index) => (
                <div
                  key={`${pillar.label}-${index}`}
                  className={`ll-service-card ${index === 1 ? 'featured' : ''}`}
                >
                  <div className="ll-service-num">{pillar.label}</div>
                  <h2 className="ll-serif-title" style={{ fontSize: '1.35rem' }}>
                    {pillar.title}
                  </h2>
                  <p className="ll-service-desc" style={{ fontSize: '0.88rem' }}>
                    {pillar.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Executive Leadership: Mohab Samak — CEO (Strictly CEO title only) */}
        <section id="leadership" className="ll-section-muted">
          <div className="ll-container">
            <div className="ll-leadership-panel">
              <div className="ll-leadership-emblem">
                {/* Plain <img> on purpose: static logo, and next/image needs sharp at runtime (cPanel host). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo-horizontal-white.png"
                  alt="LEAP LIVING"
                  width={118}
                  height={34}
                  loading="lazy"
                  decoding="async"
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
                    {leadership.name}
                  </div>
                  <div
                    style={{
                      color: 'var(--brand-teal-50)',
                      fontSize: '0.82rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {leadership.role}
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
                  {leadership.badge}
                </div>
              </div>

              <div>
                <div className="ll-eyebrow">Leadership</div>
                <div className="ll-leadership-meta">
                  <span className="ll-leadership-name">{leadership.name}</span>
                  <span className="ll-leadership-title">{leadership.shortRole}</span>
                </div>
                {leadership.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    style={{
                      fontSize: '0.94rem',
                      lineHeight: 1.75,
                      marginBottom: index === leadership.paragraphs.length - 1 ? '1.5rem' : '1rem',
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
                <Link href={leadership.ctaHref} className="ll-btn ll-btn-primary">
                  <span>{leadership.ctaLabel}</span>
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
                <div className="ll-eyebrow">{services.eyebrow}</div>
                <h2 className="ll-serif-title ll-section-title">{services.title}</h2>
                <p className="ll-section-lead">{services.lead}</p>
              </div>
            </div>

            <div className="ll-services-catalog-grid">
              {services.items.map((service, idx) => (
                <div
                  key={`${service.title}-${idx}`}
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
        <DeveloperShowcase brands={developers} />
      </main>

      <SiteFooter />
    </>
  )
}
