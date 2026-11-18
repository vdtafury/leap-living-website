import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import Database from 'better-sqlite3'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

// A throwaway database per run; the route creates its tables itself (ensureSchema).
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leap-inquiries-'))
const dbFile = path.join(dir, 'test.db')
let route: typeof import('./route')

beforeAll(async () => {
  vi.stubEnv('DATABASE_URL', `file:${dbFile}`)
  route = await import('./route')
})
afterAll(() => {
  vi.unstubAllEnvs()
  fs.rmSync(dir, { recursive: true, force: true })
})

const valid = {
  type: 'PROPERTY_INQUIRY',
  name: 'Omar Haddad',
  phone: '+971 50 123 4567',
  email: 'omar@example.com',
  interest: 'The Waterfront Sky Villa',
  notes: 'Viewing next week',
  context: 'The Waterfront Sky Villa',
  pagePath: '/properties/palm-jumeirah-waterfront-sky-villa',
}

let ipCounter = 0
const post = (body: unknown, headers: Record<string, string> = {}) =>
  route.POST(
    new Request('http://leapliving.test/api/inquiries', {
      method: 'POST',
      headers: {
        host: 'leapliving.test',
        origin: 'http://leapliving.test',
        'content-type': 'application/json',
        'x-forwarded-for': `198.51.100.${++ipCounter}`,
        ...headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )

const rows = () => new Database(dbFile, { readonly: true }).prepare('SELECT * FROM "Inquiry"').all()

describe('POST /api/inquiries', () => {
  it('saves a valid request (201) with a hashed IP, never the raw one', async () => {
    const res = await post(valid)
    expect(res.status).toBe(201)
    const { id } = await res.json()
    const saved = rows().find((r) => (r as { id: string }).id === id) as Record<string, string>
    expect(saved).toMatchObject({ name: 'Omar Haddad', type: 'PROPERTY_INQUIRY', status: 'NEW' })
    expect(saved.ipHash).toMatch(/^[0-9a-f]{32}$/)
    expect(JSON.stringify(saved)).not.toContain('198.51.100.')
  })

  it('rejects invalid fields (400) with a message per field, and saves nothing', async () => {
    const before = rows().length
    const res = await post({ ...valid, email: 'nope', name: '' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(Object.keys(body.fields).sort()).toEqual(['email', 'name'])
    expect(rows().length).toBe(before)
  })

  it('pretends success for bots that fill the honeypot, but stores nothing', async () => {
    const before = rows().length
    const res = await post({ ...valid, website: 'http://spam.example' })
    expect(res.status).toBe(201)
    expect(rows().length).toBe(before)
  })

  it('refuses posts from other websites (403)', async () => {
    expect((await post(valid, { origin: 'https://evil.example' })).status).toBe(403)
  })

  it('rejects broken JSON (400) and oversized bodies (413)', async () => {
    expect((await post('{not json')).status).toBe(400)
    expect((await post({ ...valid, notes: 'x'.repeat(20_000) })).status).toBe(413)
  })

  it('rate-limits one visitor to 5 requests per 10 minutes (429)', async () => {
    const ip = { 'x-forwarded-for': '203.0.113.99' }
    for (let i = 0; i < 5; i++) expect((await post(valid, ip)).status).toBe(201)
    const res = await post(valid, ip)
    expect(res.status).toBe(429)
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThan(0)
  })
})

// GET (admin export, session + permission) is covered in src/app/api/routes.test.ts.
