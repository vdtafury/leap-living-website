'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRightIcon, CalculatorIcon, CloseIcon, MenuIcon } from '@/components/ui/icons'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/sell', label: 'Sell' },
  { href: '/projects', label: 'Insights' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const updateScroll = () => {
      setScrolled(window.scrollY > 24)
    }
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  const isOverlayPage = pathname === '/'
  const isTransparent = isOverlayPage && !scrolled && !mobileOpen

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const headerClass = [
    'll-header',
    isOverlayPage ? 'll-header--overlay' : '',
    isTransparent ? 'll-header--transparent' : 'll-header--glass',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={headerClass}>
      <div className="ll-container ll-header-inner">
        <Link href="/" className="ll-brand-group" aria-label="LEAP LIVING Home">
          <img
            src={
              isTransparent
                ? '/brand/logo-horizontal-white.png'
                : '/brand/logo-horizontal-brand.png'
            }
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
          <Link href="/mortgage" className="ll-btn ll-btn-mortgage">
            <CalculatorIcon size={15} />
            <span>Mortgage Calculator</span>
          </Link>
          <Link href="/sell#valuation-form" className="ll-btn ll-btn-primary">
            <span>Free Valuation</span>
            <ArrowUpRightIcon size={14} />
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
                href="/mortgage"
                onClick={() => setMobileOpen(false)}
                className="ll-btn ll-btn-mortgage"
              >
                <CalculatorIcon size={15} />
                <span>Mortgage Calculator</span>
              </Link>
              <Link
                href="/sell#valuation-form"
                onClick={() => setMobileOpen(false)}
                className="ll-btn ll-btn-primary"
              >
                <span>Free Valuation</span>
                <ArrowUpRightIcon size={14} />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
