import { createHmac } from 'node:crypto'

/**
 * Best-effort client IP. Behind cPanel's Apache/Passenger proxy the address arrives in
 * X-Forwarded-For (first entry). It can be spoofed, so use it only for rate limiting and
 * hashed abuse tracing, never for access decisions.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * Keyed hash of an IP for abuse tracing. A plain SHA-256 of an IPv4 address can be reversed
 * by trying all 4 billion addresses, so it is an HMAC with a server-side secret:
 * `IP_HASH_SECRET`, else the admin password (never stored or shown), else a constant (dev only).
 * Changing the secret only means older rows no longer group with newer ones.
 */
export function hashIp(ip: string, env: Record<string, string | undefined> = process.env): string {
  const key = env.IP_HASH_SECRET || env.ADMIN_PASSWORD || 'leap-living-dev'
  return createHmac('sha256', key).update(ip).digest('hex').slice(0, 32)
}

/**
 * Blocks cross-site form posts: browsers always send Origin on POST, and it must be this site.
 * Requests without Origin (curl, server-to-server) are allowed; the rate limiter covers them.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
