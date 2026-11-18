'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

// False until the first page has shown, so the page the visitor lands on is never animated
// (the server HTML and the first client render stay identical, and the hero paints at once).
let hasNavigated = false

/**
 * Page change (owner, 2026-11-18: smooth, then "instant"). A template remounts on every route
 * change, so the new page mounts straight away and only then fades in (CSS, 200ms, see
 * 24-page-transitions.css). Nothing waits for the animation: the earlier `<ViewTransition>`
 * version held the old page until the new page's images loaded (270ms to 1.8s per click).
 * The header is not animated. Query-string changes (listing filters) do not remount, the
 * landing page and the admin are never animated.
 */
export default function Template({ children }: { children: ReactNode }) {
  const admin = usePathname().startsWith('/admin')
  const [animate] = useState(() => hasNavigated && !admin)

  useEffect(() => {
    hasNavigated = true
  }, [])

  return <div className={animate ? 'll-page ll-page-enter' : 'll-page'}>{children}</div>
}
