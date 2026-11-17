import { describe, expect, it } from 'vitest'
import { clientIp, hashIp, isSameOrigin } from './request'

const req = (headers: Record<string, string>) => new Request('http://site.test/api', { headers })

describe('request helpers', () => {
  it('takes the first X-Forwarded-For address', () => {
    expect(clientIp(req({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7')
    expect(clientIp(req({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2')
    expect(clientIp(req({}))).toBe('unknown')
  })

  it('hashes IPs (no raw address stored)', () => {
    expect(hashIp('203.0.113.7')).toMatch(/^[0-9a-f]{32}$/)
    expect(hashIp('203.0.113.7')).not.toContain('203')
    // Keyed: not the plain SHA-256 that could be reversed by brute force, and stable per key.
    const a = hashIp('203.0.113.7', { IP_HASH_SECRET: 'one' })
    expect(a).toBe(hashIp('203.0.113.7', { IP_HASH_SECRET: 'one' }))
    expect(a).not.toBe(hashIp('203.0.113.7', { IP_HASH_SECRET: 'two' }))
    expect(hashIp('203.0.113.7', { ADMIN_PASSWORD: 'p' })).not.toBe(
      hashIp('203.0.113.7', { ADMIN_PASSWORD: 'q' }),
    )
  })

  it('accepts same-origin and Origin-less requests, rejects other sites', () => {
    expect(isSameOrigin(req({ host: 'leapliving.ae', origin: 'https://leapliving.ae' }))).toBe(true)
    expect(isSameOrigin(req({ host: 'leapliving.ae' }))).toBe(true)
    expect(isSameOrigin(req({ host: 'leapliving.ae', origin: 'https://evil.example' }))).toBe(false)
    expect(isSameOrigin(req({ host: 'leapliving.ae', origin: 'null' }))).toBe(false)
  })
})
