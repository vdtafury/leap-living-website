import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  ...(process.env.NEXT_STANDALONE === '1' ? { output: 'standalone' } : {}),
  // Native and generated packages must not be bundled by the Next.js compiler.
  serverExternalPackages: [
    'sharp',
    'better-sqlite3',
    '@prisma/adapter-better-sqlite3',
    '@prisma/client',
  ],
}

export default nextConfig
