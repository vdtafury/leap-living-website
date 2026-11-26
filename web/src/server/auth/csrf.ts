import { createHash, timingSafeEqual } from 'node:crypto'
import { requestHost, urlMatchesHost } from '@/server/request'

/**
 * CSRF token bound to the session (synchronizer-token pattern without server state): it is
 * derived from the session id, which never leaves the server, so another site cannot compute
 * it. Every admin form carries it in a hidden field; uploads send it in a header.
 */
export type CsrfScope = 'admin' | 'account'

export function csrfTokenFor(sessionId: string, scope: CsrfScope = 'admin'): string {
  // Different prefixes: an admin token is never valid for a website account and vice versa.
  const prefix = scope === 'admin' ? 'csrf:v1:' : 'csrf:account:v1:'
  return createHash('sha256').update(`${prefix}${sessionId}`).digest('base64url')
}

export function csrfValid(sessionId: string, token: unknown, scope: CsrfScope = 'admin'): boolean {
  if (typeof token !== 'string' || token.length === 0 || token.length > 100) return false
  const expected = Buffer.from(csrfTokenFor(sessionId, scope))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/**
 * Same-site check for state-changing requests, strongest signal first:
 *   1. Origin, when the browser sends it: must be this host.
 *   2. Fetch Metadata (`Sec-Fetch-Site`, which page scripts cannot set): must be same-origin.
 *      Current Chrome omits Origin on same-origin fetch POSTs (server actions) but sends this.
 *   3. Referer: must be a page of this host.
 * Nothing at all (some non-browser client): refused. The session CSRF token is checked on top.
 */
export function originAllowed(headers: Headers): boolean {
  const host = requestHost(headers)
  const origin = headers.get('origin')
  if (origin) return urlMatchesHost(origin, host)
  const fetchSite = headers.get('sec-fetch-site')
  if (fetchSite) return fetchSite === 'same-origin'
  const referer = headers.get('referer')
  if (referer) return urlMatchesHost(referer, host)
  return false
}
