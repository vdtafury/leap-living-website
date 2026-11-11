import Link from 'next/link'
import {
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  YouTubeIcon,
} from '@/components/ui/icons'

export function SiteFooter() {
  return (
    <footer className="ll-footer">
      <div className="ll-footer-bg" aria-hidden="true">
        <img
          src="/images/footer-glass-facade.jpg"
          alt="Modern architectural glass facade tower"
          className="ll-footer-bg-img"
        />
        <div className="ll-footer-bg-scrim" />
      </div>

      <div className="ll-container ll-footer-content">
        <div className="ll-footer-grid">
          <div className="ll-footer-brand-col">
            <Link href="/" className="ll-brand-group" style={{ marginBottom: '0.9rem' }}>
              <img
                src="/brand/logo-horizontal-white.png"
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
              <a href="tel:+971521459888" className="ll-footer-contact-row">
                <PhoneIcon size={14} />
                <span>+971 52 145 9888</span>
              </a>
              <a href="mailto:contact@leapliving.ae" className="ll-footer-contact-row">
                <MailIcon size={14} />
                <span>contact@leapliving.ae</span>
              </a>
            </div>

            <div className="ll-footer-socials" aria-label="Social Media Channels">
              <Link href="/contact" aria-label="LEAP LIVING on LinkedIn" className="ll-social-link">
                <LinkedInIcon size={16} />
              </Link>
              <Link href="/contact" aria-label="LEAP LIVING on Instagram" className="ll-social-link">
                <InstagramIcon size={16} />
              </Link>
              <Link href="/contact" aria-label="LEAP LIVING on YouTube" className="ll-social-link">
                <YouTubeIcon size={17} />
              </Link>
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
