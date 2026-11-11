import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ConsultationForm } from '@/components/forms/consultation-form'
import { ImageGallery } from '@/components/ui/image-gallery'
import { CheckIcon, ChevronRightIcon, MapPinIcon } from '@/components/ui/icons'
import { PROJECTS } from '@/data/catalog'

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = PROJECTS.find((p) => p.slug === slug)
  if (!project) return { title: 'Project Not Found | LEAP LIVING' }

  return {
    title: `${project.title} — ${project.community} | LEAP LIVING`,
    description: project.overview,
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = PROJECTS.find((p) => p.slug === slug)

  if (!project) notFound()

  return (
    <>
      <SiteHeader />

      <main>
        <section className="ll-page-hero" style={{ paddingBottom: '2.25rem' }}>
          <div className="ll-container">
            <div className="ll-breadcrumbs">
              <Link href="/">Home</Link>
              <ChevronRightIcon size={13} />
              <Link href="/projects">Projects</Link>
              <ChevronRightIcon size={13} />
              <span>{project.title}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div className="ll-eyebrow">
                  {project.developer} · {project.status}
                </div>
                <h1 className="ll-page-hero-title" style={{ marginBottom: '0.5rem' }}>
                  {project.title}
                </h1>
                <div className="ll-property-location" style={{ fontSize: '0.92rem' }}>
                  <MapPinIcon size={16} />
                  <span>{project.community}, Dubai</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="ll-field-label" style={{ marginBottom: '0.2rem' }}>
                  Guide Pricing
                </div>
                <div
                  className="tabular-nums"
                  style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--dark-teal)' }}
                >
                  {project.startingPriceLabel}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ll-section-muted">
          <div className="ll-container ll-detail-layout">
            <div>
              <ImageGallery images={project.gallery} title={project.title} />

              <div className="ll-key-specs-box">
                {project.keyFacts.map((fact) => (
                  <div key={fact.label} className="ll-key-spec-cell">
                    <div className="ll-key-spec-label">{fact.label}</div>
                    <div className="ll-key-spec-value">{fact.value}</div>
                  </div>
                ))}
              </div>

              <div className="ll-form-card" style={{ marginBottom: '1.5rem' }}>
                <div className="ll-eyebrow">Development Briefing</div>
                <h2 className="ll-serif-title" style={{ fontSize: '1.55rem', marginBottom: '0.85rem' }}>
                  Architectural &amp; Investment Overview
                </h2>
                <p style={{ fontSize: '0.94rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                  {project.overview}
                </p>

                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  Available Configurations
                </h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>{project.unitTypes}</p>

                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  Key Amenities &amp; Infrastructure
                </h3>
                <div className="ll-highlight-list">
                  {project.amenities.map((item) => (
                    <div key={item} className="ll-highlight-item">
                      <CheckIcon size={16} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ position: 'sticky', top: '104px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h2 className="ll-serif-title" style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>
                  Register for Project Dossier
                </h2>
                <p style={{ fontSize: '0.85rem' }}>
                  Request verified unit availability, floorplans, and developer payment schedules.
                </p>
              </div>
              <ConsultationForm mode="PROJECT_BRIEFING" contextTitle={project.title} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

