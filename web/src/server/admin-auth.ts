import { createHash, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createRateLimiter } from './rate-limit'
import { clientIp } from './request'

/**
 * HTTP Basic auth for the admin-only endpoints (/api/upload, /api/sharp, GET /api/inquiries)
 * until the real admin login exists. Credentials come from ADMIN_USER / ADMIN_PASSWORD.
 * If either is unset the endpoints are switched off (404), which is the safe default.
 */
const failures = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 })
const MIN_PASSWORD_LENGTH = 12

const digest = (value: string) => createHash('sha256').update(value).digest()
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b))

type Env = Record<string, string | undefined>

export type AdminCheck = { ok: true } | { ok: false; response: NextResponse }

export function adminConfigured(env: Env = process.env): boolean {
  return Boolean(env.ADMIN_USER) && (env.ADMIN_PASSWORD?.length ?? 0) >= MIN_PASSWORD_LENGTH
}

export function checkAdmin(request: Request, env: Env = process.env): AdminCheck {
  if (!adminConfigured(env)) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: 'not found' }, { status: 404 }),
    }
  }

  const ip = clientIp(request)
  const tooMany = () => ({
    ok: false as const,
    response: NextResponse.json(
      { ok: false, error: 'too many attempts, try again later' },
      { status: 429, headers: { 'Retry-After': '900' } },
    ),
  })
  // Blocked IPs are refused even with the right password, so guessing stops at the limit.
  if (failures.blocked(ip)) return tooMany()

  const header = request.headers.get('authorization') ?? ''
  const [scheme, encoded] = header.split(' ')
  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8')
    const sep = decoded.indexOf(':')
    const user = sep >= 0 ? decoded.slice(0, sep) : ''
    const password = sep >= 0 ? decoded.slice(sep + 1) : ''
    // Both compared, always, so timing does not reveal which one was wrong.
    const userOk = safeEqual(user, env.ADMIN_USER!)
    const passwordOk = safeEqual(password, env.ADMIN_PASSWORD!)
    if (userOk && passwordOk) return { ok: true }
  }

  // Only wrong credentials count: a browser's first request carries none, by design.
  if (header && !failures.hit(ip).ok) return tooMany()
  return {
    ok: false,
    response: NextResponse.json(
      { ok: false, error: 'authentication required' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Leap Living admin", charset="UTF-8"' },
      },
    ),
  }
}
