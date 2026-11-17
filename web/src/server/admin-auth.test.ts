import { describe, expect, it } from 'vitest'
import { adminConfigured, checkAdmin } from './admin-auth'

const env = { ADMIN_USER: 'leap', ADMIN_PASSWORD: 'correct-horse-battery' }
const basic = (user: string, password: string) =>
  `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`
const req = (ip: string, authorization?: string) =>
  new Request('http://site.test/api/upload', {
    headers: { 'x-forwarded-for': ip, ...(authorization ? { authorization } : {}) },
  })

describe('checkAdmin', () => {
  it('is switched off (404) without credentials or with a short password', () => {
    expect(adminConfigured({})).toBe(false)
    expect(adminConfigured({ ADMIN_USER: 'a', ADMIN_PASSWORD: 'short' })).toBe(
      false,
    )
    const result = checkAdmin(req('1.1.1.1', basic('leap', 'x')), {})
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.response.status).toBe(404)
  })

  it('asks the browser for a login (401 + WWW-Authenticate)', () => {
    const result = checkAdmin(req('2.2.2.2'), env)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(401)
      expect(result.response.headers.get('www-authenticate')).toContain('Basic')
    }
  })

  it('accepts the right user and password only', () => {
    expect(checkAdmin(req('3.3.3.3', basic('leap', 'correct-horse-battery')), env).ok).toBe(true)
    expect(checkAdmin(req('3.3.3.3', basic('leap', 'wrong-password!!')), env).ok).toBe(false)
    expect(checkAdmin(req('3.3.3.3', basic('other', 'correct-horse-battery')), env).ok).toBe(false)
    expect(checkAdmin(req('3.3.3.3', 'Bearer abc'), env).ok).toBe(false)
  })

  it('blocks an IP after 10 wrong passwords, even if the 11th is right', () => {
    const ip = '4.4.4.4'
    for (let i = 0; i < 10; i++) checkAdmin(req(ip, basic('leap', `guess-${i}-xxxxxx`)), env)
    const result = checkAdmin(req(ip, basic('leap', 'correct-horse-battery')), env)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.response.status).toBe(429)
    // Other visitors are unaffected.
    expect(checkAdmin(req('5.5.5.5', basic('leap', 'correct-horse-battery')), env).ok).toBe(true)
  })
})
