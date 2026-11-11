import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'LEAP LIVING | Real Estate Consultancy — Dubai, UAE',
  description:
    'Certainty through precision. Leap Living brings institutional clarity, strategic foresight, and over two decades of Dubai real estate leadership to high-value property decisions.',
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
