'use client'

import { useLayoutEffect, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// How long the old page may stay frozen while the next page loads. Navbar pages are prefetched
// and arrive in well under 100ms; after this the swap simply happens without the crossfade.
const MAX_WAIT_MS = 1500

type Pending = { from: string; done: () => void }

function wantsTransition(event: MouseEvent): HTMLAnchorElement | null {
  if (event.defaultPrevented || event.button !== 0) return null
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null
  const target = event.target as Element | null
  // Do not hijack clicks that immediately follow a carousel mouse drag.
  if (target?.closest('[data-dragging="true"], [data-suppress-click="true"]')) return null
  const link = target?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!link || link.target || link.hasAttribute('download')) return null
  // A button or field inside a link handles its own click.
  if (target?.closest('button, input, select, textarea, [role="button"]')?.closest('a') === link)
    return null
  const url = new URL(link.href, location.href)
  if (url.origin !== location.origin) return null
  // Same page (hash, filters in the query string): no page change, no crossfade.
  if (url.pathname === location.pathname) return null
  if (url.pathname.startsWith('/admin') || location.pathname.startsWith('/admin')) return null
  if (url.pathname.startsWith('/api/')) return null
  return link
}

/**
 * Smooth page changes (owner, 2026-11-18, D-43): the old page fades out while the new page
 * fades in and rises; the header stays still (24-page-transitions.css).
 *
 * Uses the browser's View Transitions API directly. React's `<ViewTransition>` was tried first
 * and dropped: it holds the old page until the new page's images have loaded (up to 1.8s).
 * Here the browser freezes the old page only until Next.js has rendered the new route, which
 * for the prefetched navbar pages takes tens of milliseconds, then crossfades.
 *
 * Only plain left-clicks on links to another public page are handled. Browsers without the
 * API, visitors with reduced motion, the admin, back/forward and same-page links behave as before.
 */
export function PageTransitions() {
  const router = useRouter()
  const pathname = usePathname()
  const pending = useRef<Pending | null>(null)

  // The new route has been committed to the DOM (before paint): let the browser take the
  // "after" picture and start the animation (handles server redirects as well as direct targets).
  useLayoutEffect(() => {
    if (pending.current && pathname !== pending.current.from) {
      pending.current.done()
      pending.current = null
    }
  }, [pathname])

  useEffect(() => {
    if (typeof document.startViewTransition !== 'function') return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const onClick = (event: MouseEvent) => {
      if (reduceMotion.matches || pending.current) return
      const link = wantsTransition(event)
      if (!link) return
      event.preventDefault()
      event.stopPropagation()
      const url = new URL(link.href, location.href)
      const href = url.pathname + url.search + url.hash
      const from = location.pathname

      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const timer = window.setTimeout(() => {
              pending.current = null
              resolve()
            }, MAX_WAIT_MS)
            pending.current = {
              from,
              done: () => {
                window.clearTimeout(timer)
                resolve()
              },
            }
            router.push(href)
          }),
      )
    }

    // Capture on window: runs before the Next.js <Link> handler, which is then skipped.
    window.addEventListener('click', onClick, true)
    return () => window.removeEventListener('click', onClick, true)
  }, [router])

  return null
}
