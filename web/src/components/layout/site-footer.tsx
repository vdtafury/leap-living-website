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
import { SITE } from '@/data/site'

const SOCIAL_LINKS = [
  { href: SITE.socials.instagram, label: 'Instagram', Icon: InstagramIcon, size: 16 },
  { href: SITE.socials.linkedin, label: 'LinkedIn', Icon: LinkedInIcon, size: 16 },
  { href: SITE.socials.facebook, label: 'Facebook', Icon: FacebookIcon, size: 16 },
  { href: SITE.socials.tiktok, label: 'TikTok', Icon: TikTokIcon, size: 15 },
]

export function SiteFooter() {
  return (
    <footer className="ll-footer">
      <div className="ll-container ll-footer-content">
        <div className="ll-footer-grid">
          <div className="ll-footer-brand-col">
            <Link href="/" className="ll-brand-group" style={{ marginBottom: '0.9rem' }}>
              <img
                src="/brand/logo-horizontal-brand.png"
                alt="LEAP LIVING"
                style={{ height: '36px', width: 'auto', display: 'block' }}
              />
              <span className="ll-brand-divider" aria-hidden="true" />
              <span className="ll-brand-sub">
                REAL ESTATE
                <br />
                CONSULTANCY
              </span>
            </Link>
            <p className="ll-footer-tagline">Certainty through precision.</p>

            <div className="ll-footer-contact">
              <a href={SITE.phone.href} className="ll-footer-contact-row">
                <PhoneIcon size={14} />
                <span>{SITE.phone.display}</span>
              </a>
              <a href={`mailto:${SITE.email}`} className="ll-footer-contact-row">
                <MailIcon size={14} />
                <span>{SITE.email}</span>
              </a>
            </div>

            <div className="ll-footer-socials" aria-label="Social Media Channels">
              {SOCIAL_LINKS.map(({ href, label, Icon, size }) => (
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

          <div className="ll-footer-col">
            <h4 className="ll-footer-heading">Explore</h4>
            <div className="ll-footer-links">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/about#services">Real Estate Consultancy</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div className="ll-footer-col">
            <h4 className="ll-footer-heading">Properties</h4>
            <div className="ll-footer-links">
              <Link href="/buy">Buy</Link>
              <Link href="/rent">Rent</Link>
              <Link href="/sell">Sell</Link>
              <Link href="/projects">Featured Projects</Link>
            </div>
          </div>

          <div className="ll-footer-col">
            <h4 className="ll-footer-heading">Information</h4>
            <div className="ll-footer-links">
              <Link href="/about">Company Profile</Link>
              <Link href="/about#leadership">Executive Leadership</Link>
              <Link href="/sell#valuation-form">Free Property Valuation</Link>
              <Link href="/mortgage">Mortgage Calculator</Link>
              <Link href="/contact?topic=privacy">Privacy Policy</Link>
              <Link href="/contact?topic=terms">Terms of Use</Link>
            </div>
          </div>

          <div className="ll-footer-col">
            <h4 className="ll-footer-heading">Location</h4>
            <div className="ll-footer-location">
              <MapPinIcon size={15} />
              <div>
                {SITE.address.lines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
                <div>Dubai, United Arab Emirates</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ll-footer-bottom">
          <span>© 2026 Leap Living Real Estate Consultancy. All Rights Reserved.</span>
          <span>Dubai, United Arab Emirates · leapliving.ae</span>
        </div>
      </div>
    </footer>
  )
}
