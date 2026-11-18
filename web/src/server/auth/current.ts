import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { actorFromSessionToken, type SessionActor } from '@/modules/users'
import { can, ForbiddenError, type PermissionKey } from '@/modules/authorization'
import { clientIp, hashIp } from '@/server/request'
import { csrfTokenFor, csrfValid, originAllowed } from './csrf'
import { sessionCookie } from './session-token'

/** One sign-in page for visitors and the team (D-41); `/admin/login` redirects here. */
export const SIGN_IN_PATH = '/account/sign-in'

/** The signed-in admin user for this request, or null. */
export async function getActor(): Promise<SessionActor | null> {
  const jar = await cookies()
  return actorFromSessionToken(jar.get(sessionCookie().name)?.value)
}

/**
 * Page guard for /admin. Not signed in -> login. Must change the password -> that page first.
 * Missing permission -> dashboard with a notice. The data functions check permissions again.
 */
export async function requireActor(
  permission?: PermissionKey,
  { allowPasswordChange = false } = {},
): Promise<SessionActor> {
  const actor = await getActor()
  if (!actor) redirect(SIGN_IN_PATH)
  if (actor.mustChangePassword && !allowPasswordChange) redirect('/admin/change-password')
  if (permission && !can(actor, permission)) redirect('/admin?denied=1')
  return actor
}

export async function setSessionCookie(token: string) {
  const { name, options } = sessionCookie()
  ;(await cookies()).set(name, token, options)
}

export async function clearSessionCookie() {
  const { name, options } = sessionCookie()
  ;(await cookies()).set(name, '', { ...options, maxAge: 0 })
}

export async function requestInfo() {
  const h = await headers()
  const request = new Request('http://local', { headers: h })
  const ip = clientIp(request)
  return {
    ipKey: ip,
    ipHash: ip === 'unknown' ? null : hashIp(ip),
    userAgent: h.get('user-agent'),
  }
}

export const csrfToken = (actor: SessionActor) => csrfTokenFor(actor.sessionId)

export class CsrfError extends Error {
  constructor() {
    super('Invalid or missing security token. Reload the page and try again.')
    this.name = 'CsrfError'
  }
}

/** No valid session on a mutation: signed out, expired, or the browser dropped the cookie. */
export class SessionError extends Error {
  constructor() {
    super('You are signed out. Sign in again.')
    this.name = 'SessionError'
  }
}

/**
 * For every admin mutation (server actions and route handlers): signed in, Origin is this
 * site, and the CSRF token matches the session. Returns the actor.
 */
export async function requireMutation(
  token: unknown,
  { allowPasswordChange = false } = {},
): Promise<SessionActor> {
  const actor = await getActor()
  if (!actor) throw new SessionError()
  if (!originAllowed(await headers()) || !csrfValid(actor.sessionId, token)) throw new CsrfError()
  if (actor.mustChangePassword && !allowPasswordChange) throw new ForbiddenError('password-change')
  return actor
}
