import { createHmac, randomBytes } from 'node:crypto'

let ephemeralIpKey: string | null = null
let warnedMissingIpKey = false

export function normalizeHost(raw: string | null): string | null {
  const first = raw?.split(',')[0]?.trim().toLowerCase()
  if (!first) return null
  return first.replace(/:(80|443)$/, '')
}

export function requestHost(headers: Headers): string | null {
  return normalizeHost(headers.get('x-forwarded-host')) || normalizeHost(headers.get('host'))
}

export function urlMatchesHost(url: string, host: string | null): boolean {
  if (!host) return false
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    return normalizeHost(parsed.host) === host
  } catch {
    return false
  }
}

/**
 * Best-effort client IP. Behind cPanel's Apache/Passenger proxy the address arrives in
 * X-Forwarded-For (first entry). It can be spoofed, so use it only for rate limiting and
 * hashed abuse tracing, never for access decisions.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const raw = forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown'
  return raw.slice(0, 64)
}

/**
 * Keyed hash of an IP for abuse tracing. A plain SHA-256 of an IPv4 address can be reversed
 * by trying all 4 billion addresses, so it is an HMAC with a server-side secret:
 * `IP_HASH_SECRET`, else the admin password (never stored or shown), else a random per-process
 * fallback in production (or a constant in dev/test).
 * Changing the secret only means older rows no longer group with newer ones.
 */
export function hashIp(ip: string, env: Record<string, string | undefined> = process.env): string {
  let key = env.IP_HASH_SECRET || env.ADMIN_PASSWORD
  if (!key) {
    if (env.NODE_ENV === 'production') {
      if (!warnedMissingIpKey) {
        warnedMissingIpKey = true
        console.warn('[security] IP_HASH_SECRET is not set; using an ephemeral per-process key.')
      }
      ephemeralIpKey ??= randomBytes(32).toString('hex')
      key = ephemeralIpKey
    } else {
      key = 'leap-living-dev'
    }
  }
  return createHmac('sha256', key).update(ip).digest('hex').slice(0, 32)
}

/**
 * Blocks cross-site form posts: browsers always send Origin (or Fetch Metadata / Referer) on POST,
 * and it must match this site. Plain non-browser requests without any of those headers (curl,
 * server-to-server) are allowed; the rate limiter covers them.
 */
export function isSameOrigin(request: Request): boolean {
  const host = requestHost(request.headers)
  const origin = request.headers.get('origin')
  if (origin) return urlMatchesHost(origin, host)
  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite) return fetchSite === 'same-origin' || fetchSite === 'none'
  const referer = request.headers.get('referer')
  if (referer) return urlMatchesHost(referer, host)
  return true
}
