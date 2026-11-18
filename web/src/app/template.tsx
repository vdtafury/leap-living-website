'use client'

import { ViewTransition, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Smooth page-to-page transition for the public site (owner, 2026-11-18).
 * A template remounts on every route change, so this ViewTransition plays its exit on the old
 * page and its enter on the new one (React 19.3 + the browser View Transitions API; browsers
 * without it simply swap pages as before). The header stays still (`site-header`, see
 * 24-page-transitions.css). Changing only the query string (listing filters) does not remount,
 * so filtering never animates. The admin is left out: it is a work tool and should feel instant.
 */
export default function Template({ children }: { children: ReactNode }) {
  const admin = usePathname().startsWith('/admin')
  return (
    <ViewTransition
      enter={admin ? 'none' : 'll-page-in'}
      exit={admin ? 'none' : 'll-page-out'}
      default="none"
    >
      {/* One wrapper element: React names it for the animation, so the header inside keeps its
          own fixed `site-header` name instead of fading with the page. */}
      <div className="ll-page">{children}</div>
    </ViewTransition>
  )
}
