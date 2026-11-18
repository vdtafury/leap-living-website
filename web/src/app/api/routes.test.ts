import { beforeAll, describe, expect, it } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment()
})

import { vi } from 'vitest'
import sharp from 'sharp'
import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { csrfTokenFor } from '@/server/auth/csrf'
import { hashSessionToken, sessionCookie } from '@/server/auth/session-token'
import { createUser, login } from '@/modules/users'
import { superAdmin } from '@/test/actors'
import { POST as upload } from './upload/route'
import { GET as exportInquiries, POST as submit } from './inquiries/route'

const HOST = 'leapliving.test'
const ORIGIN = `https://${HOST}`
const info = { ipKey: 'routes-test', ipHash: null, userAgent: 'vitest' }

/** Signs in a real user and returns its cookie header and CSRF token. */
async function signIn(username: string, password: string) {
  const result = await login({ username, password }, info)
  if (!result.ok) throw new Error(`login failed: ${result.reason}`)
  return {
    cookie: `${sessionCookie().name}=${result.token}`,
    csrf: csrfTokenFor(hashSessionToken(result.token)),
  }
}

async function makeUser(username: string, roleKey: string, password: string) {
  const created = await createUser(superAdmin(), {
    username,
    name: username,
    email: '',
    roleKey,
    password,
  })
  expect(created).toEqual({ ok: true })
  await prisma.user.update({ where: { username }, data: { mustChangePassword: false } })
}

let jpeg: Buffer
const uploadRequest = (headers: Record<string, string>) => {
  const body = new FormData()
  body.append('file', new File([new Uint8Array(jpeg)], 'photo.jpg', { type: 'image/jpeg' }))
  return new Request(`${ORIGIN}/api/upload`, {
    method: 'POST',
    body,
    headers: { host: HOST, ...headers },
  })
}

let editor: { cookie: string; csrf: string }
let admin: { cookie: string; csrf: string }

beforeAll(async () => {
  await ensureReady()
  jpeg = await sharp({
    create: { width: 64, height: 48, channels: 3, background: '#3B9EA1' },
  })
    .jpeg()
    .toBuffer()
  await makeUser('route-editor', 'editor', 'editor-password-for-tests')
  await makeUser('route-admin', 'super_admin', 'admin-password-for-tests')
  editor = await signIn('route-editor', 'editor-password-for-tests')
  admin = await signIn('route-admin', 'admin-password-for-tests')
})

describe('POST /api/upload (session + CSRF guard)', () => {
  it('refuses anonymous requests and forged cookies', async () => {
    expect((await upload(uploadRequest({ origin: ORIGIN }))).status).toBe(401)
    const forged = uploadRequest({ origin: ORIGIN, cookie: `${sessionCookie().name}=forged` })
    expect((await upload(forged)).status).toBe(401)
    const basic = uploadRequest({
      origin: ORIGIN,
      authorization: `Basic ${Buffer.from('founder:initial-admin-password-1').toString('base64')}`,
    })
    expect((await upload(basic)).status).toBe(401)
  })

  it('refuses a signed-in request without the CSRF token, with a wrong one, or cross-site', async () => {
    expect((await upload(uploadRequest({ origin: ORIGIN, cookie: editor.cookie }))).status).toBe(
      403,
    )
    const wrong = uploadRequest({
      origin: ORIGIN,
      cookie: editor.cookie,
      'x-csrf-token': admin.csrf, // a token from another session is worthless
    })
    expect((await upload(wrong)).status).toBe(403)
    const crossSite = uploadRequest({
      origin: 'https://evil.example',
      cookie: editor.cookie,
      'x-csrf-token': editor.csrf,
    })
    expect((await upload(crossSite)).status).toBe(403)
    const noOrigin = uploadRequest({ cookie: editor.cookie, 'x-csrf-token': editor.csrf })
    expect((await upload(noOrigin)).status).toBe(403)
  })

  it('accepts a same-origin request with the session token and stores a WebP', async () => {
    const response = await upload(
      uploadRequest({ origin: ORIGIN, cookie: editor.cookie, 'x-csrf-token': editor.csrf }),
    )
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.ok).toBe(true)
    expect(data.asset.url).toMatch(/^\/media\/[0-9a-f-]{36}\.webp$/)
  })

  it('refuses a user who still has to change the password', async () => {
    await prisma.user.update({
      where: { username: 'route-editor' },
      data: { mustChangePassword: true },
    })
    const response = await upload(
      uploadRequest({ origin: ORIGIN, cookie: editor.cookie, 'x-csrf-token': editor.csrf }),
    )
    expect(response.status).toBe(403)
    await prisma.user.update({
      where: { username: 'route-editor' },
      data: { mustChangePassword: false },
    })
  })

  it('stops working once the user is deactivated (sessions are revoked)', async () => {
    await makeUser('route-temp', 'editor', 'temporary-password-for-tests')
    const temp = await signIn('route-temp', 'temporary-password-for-tests')
    const { setUserActive } = await import('@/modules/users')
    const user = await prisma.user.findUniqueOrThrow({ where: { username: 'route-temp' } })
    expect(await setUserActive(superAdmin(), user.id, false)).toEqual({ ok: true })
    const response = await upload(
      uploadRequest({ origin: ORIGIN, cookie: temp.cookie, 'x-csrf-token': temp.csrf }),
    )
    expect(response.status).toBe(401)
  })
})

const inquiry = {
  type: 'VALUATION',
  name: 'Route Test',
  phone: '+971 50 123 4567',
  email: 'route@example.com',
  interest: 'Valuation of a 2-bed in Dubai Marina',
  notes: 'automated test',
}
const post = (body: unknown, headers: Record<string, string> = {}) =>
  submit(
    new Request(`${ORIGIN}/api/inquiries`, {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: { host: HOST, origin: ORIGIN, 'content-type': 'application/json', ...headers },
    }),
  )

describe('POST /api/inquiries (public form)', () => {
  it('saves the request and queues its notification email in the same step', async () => {
    const response = await post(inquiry, { 'x-forwarded-for': '203.0.113.10' })
    expect(response.status).toBe(201)
    const { id } = await response.json()
    const saved = await prisma.inquiry.findUniqueOrThrow({ where: { id } })
    expect(saved).toMatchObject({ name: 'Route Test', type: 'VALUATION', status: 'NEW' })
    const emails = await prisma.emailOutbox.findMany({
      where: { relatedType: 'Inquiry', relatedId: id },
    })
    expect(emails).toHaveLength(1)
    // SMTP is not configured in tests: the email waits, nothing is lost
    expect(emails[0].status).toBe('PENDING')
  })

  it('rejects invalid fields, broken JSON and cross-site posts without saving', async () => {
    const before = await prisma.inquiry.count()
    expect((await post({ ...inquiry, email: 'not-an-email' })).status).toBe(400)
    expect((await post('{not json')).status).toBe(400)
    expect((await post(inquiry, { origin: 'https://evil.example' })).status).toBe(403)
    expect(await prisma.inquiry.count()).toBe(before)
  })

  it('answers a filled honeypot like a success but stores nothing', async () => {
    const before = await prisma.inquiry.count()
    expect((await post({ ...inquiry, website: 'http://spam.example' })).status).toBe(201)
    expect(await prisma.inquiry.count()).toBe(before)
  })
})

describe('GET /api/inquiries (export)', () => {
  const get = (cookie?: string, query = '') =>
    exportInquiries(
      new Request(`${ORIGIN}/api/inquiries${query}`, {
        headers: { host: HOST, ...(cookie ? { cookie } : {}) },
      }),
    )

  it('needs a session with inquiry.export', async () => {
    expect((await get()).status).toBe(401)
    expect((await get(editor.cookie)).status).toBe(403) // editors never see personal data
  })

  it('exports JSON and an Excel-safe CSV for an admin', async () => {
    const json = await (await get(admin.cookie)).json()
    expect(json.count).toBeGreaterThan(0)
    expect(json.inquiries[0]).toHaveProperty('email')

    const response = await get(admin.cookie, '?format=csv')
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toMatch(/text\/csv/)
    expect(response.headers.get('content-disposition')).toContain('attachment')
    // Raw bytes: Response.text() would silently drop the BOM that Excel needs for Arabic.
    const bytes = Buffer.from(await response.arrayBuffer())
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    expect(bytes.toString('utf8')).toContain('route@example.com')
  })
})
