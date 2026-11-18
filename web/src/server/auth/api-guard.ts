import { NextResponse } from 'next/server'
import { can, type PermissionKey } from '@/modules/authorization'
import { actorFromSessionToken, type SessionActor } from '@/modules/users'
import { csrfValid, originAllowed } from './csrf'
import { sessionCookie } from './session-token'

export type ApiGuard = { ok: true; actor: SessionActor } | { ok: false; response: NextResponse }

const deny = (status: number, error: string): ApiGuard => ({
  ok: false,
  response: NextResponse.json(
    { ok: false, error },
    { status, headers: { 'Cache-Control': 'no-store' } },
  ),
})

export function cookieValue(request: Request, name: string): string | undefined {
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return undefined
}

/**
 * Admin API routes: a valid session with the permission. Mutations also need the Origin of this
 * site and the session's CSRF token in the `x-csrf-token` header.
 */
export async function guardApi(
  request: Request,
  permission: PermissionKey,
  { mutation = false } = {},
): Promise<ApiGuard> {
  const actor = await actorFromSessionToken(cookieValue(request, sessionCookie().name))
  if (!actor) return deny(401, 'You are signed out. Sign in again.')
  if (mutation) {
    if (!originAllowed(request.headers)) return deny(403, 'forbidden')
    if (!csrfValid(actor.sessionId, request.headers.get('x-csrf-token')))
      return deny(403, 'invalid security token')
  }
  if (actor.mustChangePassword) return deny(403, 'password change required')
  if (!can(actor, permission)) return deny(403, 'forbidden')
  return { ok: true, actor }
}
