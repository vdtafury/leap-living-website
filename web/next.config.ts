import type { NextConfig } from 'next'

// Generated media (scripts/optimize-images.mjs, scripts/encode-hero-videos.sh).
// File names are not content-hashed, so cache for a week and revalidate in the
// background rather than marking them immutable.
const MEDIA_CACHE = 'public, max-age=604800, stale-while-revalidate=86400'

const nextConfig: NextConfig = {
  ...(process.env.NEXT_STANDALONE === '1' ? { output: 'standalone' } : {}),
  // Native and generated packages must not be bundled by the Next.js compiler.
  serverExternalPackages: [
    'sharp',
    'better-sqlite3',
    '@prisma/adapter-better-sqlite3',
    '@prisma/client',
  ],
  async headers() {
    return [
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: MEDIA_CACHE }] },
      { source: '/videos/:path*', headers: [{ key: 'Cache-Control', value: MEDIA_CACHE }] },
      { source: '/brand/:path*', headers: [{ key: 'Cache-Control', value: MEDIA_CACHE }] },
    ]
  },
}

export default nextConfig
