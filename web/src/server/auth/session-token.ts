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
  idleMs = SESSION_IDLE_MS,
): SessionState {
  if (session.expiresAt.getTime() <= now) return 'expired'
  if (session.lastSeenAt.getTime() + idleMs <= now) return 'idle-expired'
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

/* ------------------------------------------------------------------ website accounts (D-40) */

/** Website accounts stay signed in longer than staff: 14 days idle, 30 days at most. */
export const ACCOUNT_IDLE_MS = 14 * 24 * 60 * 60 * 1000
export const ACCOUNT_ABSOLUTE_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Cookie for website accounts. A different name from the admin cookie, so the two sessions
 * never mix: an account token is only ever looked up in CustomerSession, never in Session.
 */
export function accountCookie(
  production = process.env.NODE_ENV === 'production',
  framed = process.env.ALLOW_FRAMING === '1',
) {
  const admin = sessionCookie(production, framed)
  return {
    name: admin.name.replace('ll_session', 'll_account'),
    options: { ...admin.options, maxAge: ACCOUNT_ABSOLUTE_MS / 1000 },
  }
}
