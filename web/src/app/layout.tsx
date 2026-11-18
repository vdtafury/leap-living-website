import type { Metadata } from 'next'
import type { ReactNode } from 'react'
// Self-hosted brand fonts (no requests to Google Fonts; D-03).
import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './globals.css'
import { getPublishedContent } from '@/modules/content'
import { pageMetadata, SITE_INDEXING, SITE_URL } from '@/lib/seo'

/**
 * Every page is rendered per request from the database (published content only), so an edit
 * published in /admin is live on the next page view. SQLite reads on the same disk take well
 * under a millisecond; nothing is baked in at build time (D-31).
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const { company, seo } = await getPublishedContent('settings')
  return {
    // Resolves relative URLs (canonical, og:image) against the public origin.
    metadataBase: new URL(SITE_URL),
    ...pageMetadata({ title: seo.homeTitle, description: seo.description, path: '/' }),
    applicationName: company.name,
    // Off everywhere except the live site built with SITE_INDEXING=true (see src/lib/seo.ts).
    robots: SITE_INDEXING ? { index: true, follow: true } : { index: false, follow: false },
    icons: {
      icon: [
        { url: '/favicon.ico?v=2', sizes: 'any' },
        { url: '/brand/favicon-32x32.png?v=2', type: 'image/png', sizes: '32x32' },
        { url: '/brand/favicon-192x192.png?v=2', type: 'image/png', sizes: '192x192' },
      ],
      shortcut: [{ url: '/favicon.ico?v=2' }],
      apple: [{ url: '/brand/apple-touch-icon.png?v=2', type: 'image/png', sizes: '180x180' }],
    },
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
