import Link from 'next/link'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ConsultationForm } from '@/components/forms/consultation-form'
import { ChevronRightIcon, MailIcon, MapPinIcon, PhoneIcon } from '@/components/ui/icons'
import { getPublishedContent } from '@/modules/content'

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us | LEAP LIVING Real Estate Consultancy — Dubai',
  description:
    'Connect directly with Leap Living Real Estate Consultancy in Dubai for private advisory, acquisitions, sales, or property valuations.',
  path: '/contact',
})

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const [{ company }, { topic }] = await Promise.all([
    getPublishedContent('settings'),
    searchParams,
  ])
  const formMode = topic === 'valuation' ? 'VALUATION' : 'CONSULTATION'
  const contextTitle = topic === 'mortgage' ? 'Mortgage & Financing Advisory' : undefined
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
              Every mandate begins with a confidential conversation. Contact Leap Living directly
              regarding residential acquisitions, corporate leasing, asset valuations, or
              institutional consultancy in Dubai.
            </p>
          </div>
        </section>

        {/* Two panels of the same width and height: channels | briefing form (D-60) */}
        <section className="ll-section-muted">
          <div className="ll-container ll-contact-grid">
            <div className="ll-form-card ll-contact-card">
              <div className="ll-eyebrow">Dubai Office</div>
              <h2 className="ll-contact-title">Direct Contact Channels</h2>
              <p className="ll-contact-lead">
                Available Sunday through Friday for scheduled executive briefings, on-site property
                inspections, and private remote consultations.
              </p>

              <ul className="ll-contact-channels">
                <li>
                  <PhoneIcon size={18} />
                  <div>
                    <div className="ll-field-label">Direct Line / WhatsApp</div>
                    <a href={company.phoneHref}>{company.phoneDisplay}</a>
                  </div>
                </li>
                <li>
                  <MailIcon size={18} />
                  <div>
                    <div className="ll-field-label">Advisory Desk Email</div>
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                  </div>
                </li>
                <li>
                  <MapPinIcon size={18} />
                  <div>
                    <div className="ll-field-label">Office</div>
                    <address>
                      {company.addressLines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                      <div>{company.region}</div>
                    </address>
                  </div>
                </li>
              </ul>

              <div className="ll-contact-photo">
                <ResponsiveImg
                  src="/images/dubai-sunset-waterfront.png"
                  sizes="(max-width: 960px) 100vw, 45vw"
                  alt="Dubai skyline along the water"
                />
              </div>
            </div>

            <div className="ll-contact-form">
              <ConsultationForm
                mode={formMode}
                contextTitle={contextTitle}
                header={
                  <>
                    <div className="ll-eyebrow">Advisory Desk</div>
                    <h2 className="ll-contact-title">Schedule a Briefing</h2>
                    <p className="ll-contact-lead">
                      Select whether you are seeking a private consultation or an asset valuation.
                    </p>
                  </>
                }
              />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
