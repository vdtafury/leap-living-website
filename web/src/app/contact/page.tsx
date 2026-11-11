import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ConsultationForm } from '@/components/forms/consultation-form'
import { ChevronRightIcon, MailIcon, MapPinIcon, PhoneIcon } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Contact Us | LEAP LIVING Real Estate Consultancy — Dubai',
  description:
    'Connect directly with Leap Living Real Estate Consultancy in Dubai for private advisory, acquisitions, sales, or property valuations.',
}

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="ll-page-hero">
          <div className="ll-container">
            <div className="ll-breadcrumbs">
              <Link href="/">Home</Link>
              <ChevronRightIcon size={13} />
              <span>Contact</span>
            </div>
            <div className="ll-eyebrow">Direct Desk</div>
            <h1 className="ll-page-hero-title">Speak With Our Advisory Team</h1>
            <p className="ll-page-hero-desc">
              Every mandate begins with a confidential conversation. Contact Leap Living
              directly regarding residential acquisitions, corporate leasing, asset valuations,
              or institutional consultancy in Dubai.
            </p>
          </div>
        </section>

        <section className="ll-section-muted">
          <div className="ll-container ll-detail-layout">
            <div className="ll-form-card">
              <div className="ll-eyebrow">Dubai Office</div>
              <h2 className="ll-serif-title" style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>
                Direct Contact Channels
              </h2>
              <p style={{ fontSize: '0.92rem', marginBottom: '1.75rem' }}>
                Available Sunday through Friday for scheduled executive briefings, on-site
                property inspections, and private remote consultations.
              </p>

              <div style={{ display: 'grid', gap: '1.15rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <PhoneIcon size={18} style={{ color: 'var(--brand-teal)', marginTop: '3px' }} />
                  <div>
                    <div className="ll-field-label" style={{ marginBottom: '0.15rem' }}>
                      Direct Line / WhatsApp
                    </div>
                    <a
                      href="tel:+971521459888"
                      style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--heading)' }}
                    >
                      +971 52 145 9888
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <MailIcon size={18} style={{ color: 'var(--brand-teal)', marginTop: '3px' }} />
                  <div>
                    <div className="ll-field-label" style={{ marginBottom: '0.15rem' }}>
                      Advisory Desk Email
                    </div>
                    <a
                      href="mailto:contact@leapliving.ae"
                      style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--heading)' }}
                    >
                      contact@leapliving.ae
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <MapPinIcon size={18} style={{ color: 'var(--brand-teal)', marginTop: '3px' }} />
                  <div>
                    <div className="ll-field-label" style={{ marginBottom: '0.15rem' }}>
                      Jurisdiction
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--heading)' }}>
                      Dubai, United Arab Emirates
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderRadius: '3px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  height: '220px',
                }}
              >
                <img
                  src="/images/dubai-sunset-waterfront.png"
                  alt="Dubai skyline along the water"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '1rem' }}>
                <h2 className="ll-serif-title" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                  Schedule a Briefing
                </h2>
                <p style={{ fontSize: '0.86rem' }}>
                  Select whether you are seeking an asset valuation or advisory consultation.
                </p>
              </div>
              <ConsultationForm mode="CONSULTATION" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

