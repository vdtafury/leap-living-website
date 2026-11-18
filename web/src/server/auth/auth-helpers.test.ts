import { describe, expect, it } from 'vitest'
import { hashPassword, passwordProblem, verifyPassword } from './password'
import {
  hashSessionToken,
  newSessionToken,
  SESSION_ABSOLUTE_MS,
  SESSION_IDLE_MS,
  sessionCookie,
  sessionState,
  shouldTouch,
} from './session-token'
import { csrfTokenFor, csrfValid, originAllowed } from './csrf'
import { canAssignRole, SYSTEM_ROLES } from '@/modules/authorization'
import { editor, superAdmin } from '@/test/actors'

describe('passwords', () => {
  it('hashes with Argon2id and verifies', async () => {
    const hash = await hashPassword('correct horse battery')
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/)
    expect(await verifyPassword(hash, 'correct horse battery')).toBe(true)
    expect(await verifyPassword(hash, 'wrong')).toBe(false)
    expect(await verifyPassword('not-a-hash', 'x')).toBe(false)
  })

  it('policy: length, common, username, repetition', () => {
    expect(passwordProblem('short')).toMatch(/at least 12/)
    expect(passwordProblem('Password1234')).toMatch(/common/)
    expect(passwordProblem('my-name-is-sara-ok', 'sara')).toMatch(/username/)
    expect(passwordProblem('aaaaaaaaaaaaab')).toMatch(/repetitive/)
    expect(passwordProblem('a long and unusual phrase')).toBeNull()
  })
})

describe('session tokens', () => {
  it('are random, 256-bit, and stored only as a hash', () => {
    const a = newSessionToken()
    expect(a).toHaveLength(43)
    expect(a).not.toBe(newSessionToken())
    expect(hashSessionToken(a)).toMatch(/^[0-9a-f]{64}$/)
  })

  it('expire on idle and absolute timeouts', () => {
    const now = Date.now()
    const fresh = { lastSeenAt: new Date(now), expiresAt: new Date(now + SESSION_ABSOLUTE_MS) }
    expect(sessionState(fresh, now)).toBe('valid')
    expect(sessionState(fresh, now + SESSION_IDLE_MS)).toBe('idle-expired')
    expect(sessionState(fresh, now + SESSION_ABSOLUTE_MS)).toBe('expired')
    expect(shouldTouch(new Date(now), now + 60_000)).toBe(false)
    expect(shouldTouch(new Date(now), now + 6 * 60_000)).toBe(true)
  })

  it('cookie is HttpOnly; __Host- and Secure in production; SameSite=None only for framed previews', () => {
    expect(sessionCookie(true, false)).toMatchObject({
      name: '__Host-ll_session',
      options: { httpOnly: true, secure: true, sameSite: 'lax', path: '/' },
    })
    expect(sessionCookie(false, false).options.secure).toBe(false)
    expect(sessionCookie(true, true).options).toMatchObject({ sameSite: 'none', partitioned: true })
  })
})

describe('CSRF', () => {
  it('token is bound to the session', () => {
    const token = csrfTokenFor('session-a')
    expect(csrfValid('session-a', token)).toBe(true)
    expect(csrfValid('session-b', token)).toBe(false)
    expect(csrfValid('session-a', '')).toBe(false)
    expect(csrfValid('session-a', undefined)).toBe(false)
  })

  it('origin must match the host and be present', () => {
    const h = (o: Record<string, string>) => new Headers(o)
    expect(originAllowed(h({ origin: 'https://leapliving.ae', host: 'leapliving.ae' }))).toBe(true)
    expect(originAllowed(h({ origin: 'https://evil.test', host: 'leapliving.ae' }))).toBe(false)
    expect(originAllowed(h({ host: 'leapliving.ae' }))).toBe(false)
    expect(
      originAllowed(
        h({ origin: 'https://p.e2b.app', host: 'localhost:3000', 'x-forwarded-host': 'p.e2b.app' }),
      ),
    ).toBe(true)
  })

  it('without Origin, falls back to Fetch Metadata, then Referer (same-origin fetch POSTs)', () => {
    const h = (o: Record<string, string>) => new Headers({ host: 'leapliving.ae', ...o })
    expect(originAllowed(h({ 'sec-fetch-site': 'same-origin' }))).toBe(true)
    expect(originAllowed(h({ 'sec-fetch-site': 'same-site' }))).toBe(false)
    expect(originAllowed(h({ 'sec-fetch-site': 'cross-site' }))).toBe(false)
    // Fetch Metadata wins over a Referer that claims to be ours
    expect(
      originAllowed(h({ 'sec-fetch-site': 'cross-site', referer: 'https://leapliving.ae/admin' })),
    ).toBe(false)
    expect(originAllowed(h({ referer: 'https://leapliving.ae/admin/login' }))).toBe(true)
    expect(originAllowed(h({ referer: 'https://evil.test/leapliving.ae' }))).toBe(false)
    expect(originAllowed(h({ referer: 'not a url' }))).toBe(false)
    // an Origin that does not match is never rescued by the other headers
    expect(originAllowed(h({ origin: 'https://evil.test', 'sec-fetch-site': 'same-origin' }))).toBe(
      false,
    )
  })
})

describe('role assignment', () => {
  const superRole = SYSTEM_ROLES.find((r) => r.key === 'super_admin')!
  const editorRole = SYSTEM_ROLES.find((r) => r.key === 'editor')!
  it('only a Super Admin assigns Super Admin; nobody grants what they lack', () => {
    expect(canAssignRole(superAdmin(), superRole)).toBe(true)
    expect(canAssignRole(superAdmin(), editorRole)).toBe(true)
    expect(canAssignRole(editor(), editorRole)).toBe(false) // no user.manage
    const manager = { ...editor(), permissions: new Set([...editor().permissions, 'user.manage']) }
    expect(canAssignRole(manager, superRole)).toBe(false)
    expect(canAssignRole(manager, editorRole)).toBe(true)
  })
})
