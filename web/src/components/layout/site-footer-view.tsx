import Link from 'next/link'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TikTokIcon,
} from '@/components/ui/icons'
import { DEFAULT_SETTINGS, type SiteSettings } from '@/data/content-defaults'

const SOCIAL_ICONS = [
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon, size: 16 },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon, size: 16 },
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon, size: 16 },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon, size: 15 },
] as const

/** Footer markup. Data comes from the published site settings (SiteFooter, server). */
export function SiteFooterView({ settings = DEFAULT_SETTINGS }: { settings?: SiteSettings }) {
  const { company, social, footer } = settings
  const socialLinks = SOCIAL_ICONS.filter(({ key }) => social[key]).map((item) => ({
    ...item,
    href: social[item.key],
  }))
  return (
    <footer className="ll-footer">
      <div className="ll-container ll-footer-content">
        <div className="ll-footer-grid">
          <div className="ll-footer-brand-col">
            <Link href="/" className="ll-brand-group" style={{ marginBottom: '0.9rem' }}>
              {/* Plain <img> on purpose: static logo, and next/image needs sharp at runtime (cPanel host). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-horizontal-teal.png"
                alt="LEAP LIVING"
                width={125}
                height={36}
                loading="lazy"
                decoding="async"
                style={{ height: '36px', width: 'auto', display: 'block' }}
              />
              <span className="ll-brand-divider" aria-hidden="true" />
              <span className="ll-brand-sub">
                REAL ESTATE
                <br />
                CONSULTANCY
              </span>
            </Link>
            <p className="ll-footer-tagline">{company.tagline}</p>

            <div className="ll-footer-contact">
              <a href={company.phoneHref} className="ll-footer-contact-row">
                <PhoneIcon size={14} />
                <span>{company.phoneDisplay}</span>
              </a>
              <a href={`mailto:${company.email}`} className="ll-footer-contact-row">
                <MailIcon size={14} />
                <span>{company.email}</span>
              </a>
            </div>

            <div className="ll-footer-socials" aria-label="Social Media Channels">
              {socialLinks.map(({ href, label, Icon, size }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`LEAP LIVING on ${label}`}
                  className="ll-social-link"
                >
                  <Icon size={size} />
                </a>
              ))}
            </div>
          </div>

          {footer.columns.map((column) => (
            <div key={column.title} className="ll-footer-col">
              <h2 className="ll-footer-heading">{column.title}</h2>
              <div className="ll-footer-links">
                {column.links.map((link) => (
                  <Link key={`${link.label}-${link.href}`} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="ll-footer-col">
            <h2 className="ll-footer-heading">{footer.locationTitle}</h2>
            <div className="ll-footer-location">
              <MapPinIcon size={15} />
              <div>
                {company.addressLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
                <div>{company.region}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ll-footer-bottom">
          <span>{footer.copyright}</span>
          <span>{footer.note}</span>
        </div>
      </div>
    </footer>
  )
}
