import Link from 'next/link'
import { MailIcon, MapPinIcon, PhoneIcon } from '@/components/ui/icons'

export function SiteFooter() {
  return (
    <footer className="ll-footer">
      <div className="ll-container">
        <div className="ll-footer-grid">
          <div>
            <Link href="/" className="ll-brand-group" style={{ marginBottom: '1rem' }}>
              <img
                src="/brand/logo-horizontal-brand.png"
                alt="LEAP LIVING"
                style={{ height: '34px', width: 'auto', display: 'block' }}
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
              <div className="ll-footer-contact-row">
                <MapPinIcon size={14} />
                <span>Dubai, United Arab Emirates</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="ll-footer-heading">Advisory</h4>
            <div className="ll-footer-links">
              <Link href="/">Home</Link>
              <Link href="/about">About Leap Living</Link>
              <Link href="/about#services">Real Estate Consultancy</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="ll-footer-heading">Properties</h4>
            <div className="ll-footer-links">
              <Link href="/buy">Buy in Dubai</Link>
              <Link href="/rent">Rent in Dubai</Link>
              <Link href="/projects">Featured Projects</Link>
              <Link href="/sell">Sell With Us</Link>
            </div>
          </div>

          <div>
            <h4 className="ll-footer-heading">Tools &amp; Valuations</h4>
            <div className="ll-footer-links">
              <Link href="/sell#valuation-form">Free Property Valuation</Link>
              <Link href="/mortgage">Mortgage Calculator</Link>
              <Link href="/about#leadership">Executive Leadership</Link>
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
