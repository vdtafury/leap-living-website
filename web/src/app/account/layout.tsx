import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

/** Website accounts (D-40): personal pages, never indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="ll-acc-main">{children}</main>
      <SiteFooter />
    </>
  )
}
