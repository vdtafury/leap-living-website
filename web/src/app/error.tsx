'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { StatusPage } from '@/components/layout/status-page'

/** Shown when a page fails while rendering (the details stay in the server log). */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <SiteHeader />
      <main>
        <StatusPage
          code="Error"
          eyebrow="Something went wrong"
          title="We could not load this page"
          description="A temporary problem stopped this page from loading. Please try again; if it keeps happening, call +971 52 145 9888 and we will help directly."
          actions={
            <>
              <button type="button" onClick={reset} className="ll-btn ll-btn-light">
                Try Again
              </button>
              <Link href="/" className="ll-btn ll-btn-outline-light">
                Back to Home
              </Link>
            </>
          }
        />
      </main>
      <SiteFooter />
    </>
  )
}
