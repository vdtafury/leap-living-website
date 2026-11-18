import { createHash, randomBytes } from 'node:crypto'

/** Pure session helpers (no I/O), unit-tested in session-token.test.ts. */

export const SESSION_IDLE_MS = 2 * 60 * 60 * 1000 // 2 h without activity
export const SESSION_ABSOLUTE_MS = 12 * 60 * 60 * 1000 // 12 h after sign-in, whatever happens
/** lastSeenAt is written at most this often, so every page view is not a database write */
export const SESSION_TOUCH_MS = 5 * 60 * 1000

/** 256-bit random token for the cookie. Only its hash is stored. */
export function newSessionToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export type SessionState = 'valid' | 'idle-expired' | 'expired'

export function sessionState(
  session: { lastSeenAt: Date; expiresAt: Date },
  now = Date.now(),
): SessionState {
  if (session.expiresAt.getTime() <= now) return 'expired'
  if (session.lastSeenAt.getTime() + SESSION_IDLE_MS <= now) return 'idle-expired'
  return 'valid'
}

export function shouldTouch(lastSeenAt: Date, now = Date.now()): boolean {
  return now - lastSeenAt.getTime() >= SESSION_TOUCH_MS
}

/**
 * Cookie name and flags. `__Host-` (production) forces Secure, path=/ and no Domain, so a
 * sibling subdomain cannot set or read it. Development on http uses a plain name.
 * `framed` (ALLOW_FRAMING=1, preview builds only) switches to SameSite=None + Partitioned so
 * the admin works inside a preview iframe; CSRF is still blocked by the token and Origin checks.
 */
export function sessionCookie(
  production = process.env.NODE_ENV === 'production',
  framed = process.env.ALLOW_FRAMING === '1',
) {
  const secure = production || framed
  return {
    name: secure ? '__Host-ll_session' : 'll_session',
    options: {
      httpOnly: true,
      secure,
      sameSite: framed ? ('none' as const) : ('lax' as const),
      ...(framed ? { partitioned: true } : {}),
      path: '/',
      maxAge: SESSION_ABSOLUTE_MS / 1000,
    },
  }
}
