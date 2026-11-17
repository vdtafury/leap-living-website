import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { StatusPage } from '@/components/layout/status-page'
import { ArrowUpRightIcon } from '@/components/ui/icons'

export const metadata: Metadata = {
  title: 'Page Not Found | LEAP LIVING',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <StatusPage
          code="404"
          eyebrow="Page not found"
          title="This address is not on our map"
          description="The page you are looking for may have moved, or the link may be incomplete. Our advisors are one click away, and so is the rest of the portfolio."
          actions={
            <>
              <Link href="/" className="ll-btn ll-btn-light">
                Back to Home
              </Link>
              <Link href="/contact" className="ll-btn ll-btn-outline-light">
                <span>Speak to an Advisor</span>
                <ArrowUpRightIcon size={15} />
              </Link>
            </>
          }
        />
      </main>
      <SiteFooter />
    </>
  )
}
