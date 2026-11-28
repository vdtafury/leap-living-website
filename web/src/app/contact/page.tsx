import Link from 'next/link'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ConsultationForm } from '@/components/forms/consultation-form'
import {
  ArrowUpRightIcon,
  ChevronRightIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from '@/components/ui/icons'
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

        {/* Two panels of the same width and height: channels + the Marina photo with the office
            address | the briefing form with pill fields (D-60, D-63) */}
        <section className="ll-contact-band">
          <div className="ll-container ll-contact-grid">
            <div className="ll-contact-card">
              <div className="ll-contact-card-body">
                <div className="ll-eyebrow">Dubai Office</div>
                <h2 className="ll-contact-title">Direct Contact Channels</h2>
                <p className="ll-contact-lead">
                  Available Sunday through Friday for scheduled executive briefings, on-site
                  property inspections, and private remote consultations.
                </p>

                <ul className="ll-contact-channels">
                  <li>
                    <a className="ll-contact-channel" href={company.phoneHref}>
                      <span className="ll-contact-channel-icon">
                        <PhoneIcon size={18} />
                      </span>
                      <span className="ll-contact-channel-text">
                        <span className="ll-contact-channel-label">Direct Line</span>
                        <span className="ll-contact-channel-value">{company.phoneDisplay}</span>
                      </span>
                      <span className="ll-contact-channel-go">
                        <ArrowUpRightIcon size={14} />
                      </span>
                    </a>
                  </li>
                  {company.whatsapp && (
                    <li>
                      <a
                        className="ll-contact-channel"
                        href={company.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="ll-contact-channel-icon">
                          <WhatsAppIcon size={18} />
                        </span>
                        <span className="ll-contact-channel-text">
                          <span className="ll-contact-channel-label">WhatsApp</span>
                          <span className="ll-contact-channel-value">{company.phoneDisplay}</span>
                        </span>
                        <span className="ll-contact-channel-go">
                          <ArrowUpRightIcon size={14} />
                        </span>
                      </a>
                    </li>
                  )}
                  <li>
                    <a className="ll-contact-channel" href={`mailto:${company.email}`}>
                      <span className="ll-contact-channel-icon">
                        <MailIcon size={18} />
                      </span>
                      <span className="ll-contact-channel-text">
                        <span className="ll-contact-channel-label">Advisory Desk Email</span>
                        <span className="ll-contact-channel-value">{company.email}</span>
                      </span>
                      <span className="ll-contact-channel-go">
                        <ArrowUpRightIcon size={14} />
                      </span>
                    </a>
                  </li>
                </ul>
              </div>

              <figure className="ll-contact-photo">
                <ResponsiveImg
                  src="/images/dubai-marina-morning.jpg"
                  sizes="(max-width: 960px) 100vw, 46vw"
                  alt="Dubai Marina towers reflected in the water"
                />
                <span className="ll-contact-photo-mark" aria-hidden="true" />
                <figcaption className="ll-contact-photo-chip">
                  <span className="ll-contact-photo-chip-icon">
                    <MapPinIcon size={16} />
                  </span>
                  <span>
                    <span className="ll-contact-channel-label">Office</span>
                    <address>
                      {company.addressLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                      <span>{company.region}</span>
                    </address>
                  </span>
                </figcaption>
              </figure>
            </div>

            <div className="ll-contact-form ll-pill-fields">
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
