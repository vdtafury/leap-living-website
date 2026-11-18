import type { NextConfig } from 'next'

// Generated media (scripts/optimize-images.mjs, scripts/prepare-hero-original.sh).
// File names are not content-hashed, so cache for a week and revalidate in the
// background rather than marking them immutable.
const MEDIA_CACHE = 'public, max-age=604800, stale-while-revalidate=86400'

// Read at build time (the cPanel zip is built per environment). See src/lib/seo.ts.
const SITE_INDEXING = process.env.SITE_INDEXING === 'true'
// Embedding the site in other pages is blocked (clickjacking). ALLOW_FRAMING=1 lifts that for a
// build that must run inside a preview iframe; never set it for staging or production.
const ALLOW_FRAMING = process.env.ALLOW_FRAMING === '1'
const PRODUCTION = process.env.NODE_ENV === 'production'

/**
 * Content-Security-Policy. Everything the site uses is self-hosted (fonts, images, video,
 * scripts), so only 'self' is allowed. 'unsafe-inline' remains for scripts because Next.js
 * inlines its bootstrap scripts in statically generated pages (nonces need per-request
 * rendering), and for styles because components use style attributes.
 * Development (`next dev`) gets no CSP: hot reload needs eval.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `frame-ancestors ${ALLOW_FRAMING ? '*' : "'none'"}`,
].join('; ')

const SECURITY_HEADERS = [
  ...(PRODUCTION ? [{ key: 'Content-Security-Policy', value: CSP }] : []),
  ...(ALLOW_FRAMING ? [] : [{ key: 'X-Frame-Options', value: 'DENY' }]),
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Browsers only honour HSTS over HTTPS, so this is harmless on http://localhost.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  ...(SITE_INDEXING ? [] : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
]

const nextConfig: NextConfig = {
  ...(process.env.NEXT_STANDALONE === '1' ? { output: 'standalone' } : {}),
  poweredByHeader: false,
  // Native and generated packages must not be bundled by the Next.js compiler.
  serverExternalPackages: [
    'sharp',
    'better-sqlite3',
    '@prisma/adapter-better-sqlite3',
    '@prisma/client',
    '@node-rs/argon2',
    'nodemailer',
  ],
  // The standalone /mortgage page was replaced by the homepage calculator (D-30).
  async redirects() {
    return [{ source: '/mortgage', destination: '/#mortgage-calculator', permanent: true }]
  },
  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: MEDIA_CACHE }] },
      { source: '/videos/:path*', headers: [{ key: 'Cache-Control', value: MEDIA_CACHE }] },
      { source: '/brand/:path*', headers: [{ key: 'Cache-Control', value: MEDIA_CACHE }] },
    ]
  },
}

export default nextConfig
