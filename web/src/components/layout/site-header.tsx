'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRightIcon, CloseIcon, MenuIcon } from '@/components/ui/icons'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/sell', label: 'Sell' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="ll-header">
      <div className="ll-container ll-header-inner">
        <Link href="/" className="ll-brand-group" aria-label="LEAP LIVING Home">
          <img
            src="/brand/logo-horizontal-brand.png"
            alt="LEAP LIVING"
            style={{ height: '38px', width: 'auto', display: 'block' }}
          />
          <span className="ll-brand-divider" aria-hidden="true" />
          <span className="ll-brand-sub">
            REAL ESTATE
            <br />
            CONSULTANCY
          </span>
        </Link>

        <nav className="ll-nav" aria-label="Primary Navigation">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`ll-nav-link ${isActive(item.href) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ll-header-actions">
          <Link href="/sell#valuation-form" className="ll-btn ll-btn-valuation">
            Free Valuation
          </Link>
          <Link href="/contact" className="ll-btn ll-btn-primary">
            Private Advisory
            <ArrowUpRightIcon size={15} />
          </Link>
        </div>

        <button
          type="button"
          className="ll-mobile-menu-btn"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="ll-mobile-drawer">
          <nav className="ll-container ll-mobile-nav" aria-label="Mobile Navigation">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`ll-mobile-nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="ll-mobile-nav-actions">
              <Link
                href="/sell#valuation-form"
                onClick={() => setMobileOpen(false)}
                className="ll-btn ll-btn-valuation"
              >
                Free Valuation
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="ll-btn ll-btn-primary"
              >
                Private Advisory
                <ArrowUpRightIcon size={15} />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
