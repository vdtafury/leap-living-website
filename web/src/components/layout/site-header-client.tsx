'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRightIcon, CloseIcon, HomeIcon, MenuIcon } from '@/components/ui/icons'

import { DEFAULT_SETTINGS } from '@/data/content-defaults'
import { AccountButton, AccountMenuLink } from '@/components/account/account-button'

export type NavLink = { label: string; href: string }

/**
 * The header itself (client: scroll state, mobile drawer). Menu links come from the published
 * site settings via SiteHeader (server); the error page renders this directly with defaults.
 */
export function SiteHeaderClient({
  links: NAV_LINKS = DEFAULT_SETTINGS.navigation.links,
}: {
  links?: NavLink[]
}) {
  const pathname = usePathname()
  const [openPath, setOpenPath] = useState<string | null>(null)
  const mobileOpen = openPath === pathname
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const updateScroll = () => {
      setScrolled(window.scrollY > 24)
    }
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPath(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  const isOverlayPage = pathname === '/' || pathname === '/admin/preview/home'
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
        <Link
          href="/"
          className="ll-brand-group"
          aria-label="LEAP LIVING Real Estate Consultancy, home"
        >
          {/* Plain <img> on purpose: static logo, and next/image needs sharp at runtime (cPanel host). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              isTransparent
                ? '/brand/logo-horizontal-white.png'
                : '/brand/logo-horizontal-teal.png'
            }
            alt="LEAP LIVING"
            width={132}
            height={38}
            style={{ height: '38px', width: 'auto', display: 'block' }}
          />
          <span className="ll-brand-divider" aria-hidden="true" />
          <span className="ll-brand-sub">
            REAL ESTATE
            <br />
            CONSULTANCY
          </span>
        </Link>

        {/* `prefetch`: the pages are dynamic, so by default Next.js prefetches almost nothing and
            every click waits for the server. Full prefetch loads the menu pages in the background
            (kept 5 minutes), so a click shows the page at once (D-43). */}
        <nav className="ll-nav" aria-label="Primary Navigation">
          {NAV_LINKS.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              prefetch
              className={`ll-nav-link ${isActive(item.href) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ll-header-actions">
          {/* Client, 2026-11-19 (D-52): "List your property" replaces the calculator button;
              the calculator stays on the homepage and in the footer. */}
          <Link href="/sell" className="ll-btn ll-btn-list">
            <HomeIcon size={15} />
            <span>List Your Property</span>
          </Link>
          <Link href="/sell#valuation-form" className="ll-btn ll-btn-primary">
            <span>Free Valuation</span>
            <ArrowUpRightIcon size={14} />
          </Link>
          <AccountButton />
        </div>

        {/* Below 1200px the actions above are hidden; the account button stays in the bar. */}
        <AccountButton className="ll-account-btn--bar" />

        <button
          type="button"
          className="ll-mobile-menu-btn"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setOpenPath((prev) => (prev === pathname ? null : pathname))}
        >
          {mobileOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="ll-mobile-drawer">
          <nav className="ll-container ll-mobile-nav" aria-label="Mobile Navigation">
            {NAV_LINKS.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                prefetch
                onClick={() => setOpenPath(null)}
                className={`ll-mobile-nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            <AccountMenuLink onNavigate={() => setOpenPath(null)} />
            <div className="ll-mobile-nav-actions">
              <Link
                href="/sell"
                onClick={() => setOpenPath(null)}
                className="ll-btn ll-btn-list"
              >
                <HomeIcon size={15} />
                <span>List Your Property</span>
              </Link>
              <Link
                href="/sell#valuation-form"
                onClick={() => setOpenPath(null)}
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
