import { beforeAll, describe, expect, it } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment()
})

import { vi } from 'vitest'
import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { hashSessionToken } from '@/server/auth/session-token'
import { csrfTokenFor, csrfValid } from '@/server/auth/csrf'
import { ForbiddenError } from '@/modules/authorization'
import { listCustomerInquiries, listOutbox, submitInquiry } from '@/modules/inquiries'
import {
  changePassword,
  customerFromSessionToken,
  deleteAccount,
  listCustomers,
  listFavoriteItems,
  listFavoriteKeys,
  MAX_FAILED_SIGNINS,
  parseFavoriteKey,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  resetTokenUsable,
  safeNextPath,
  setCustomerActive,
  setFavorite,
  signIn,
  signOut,
  signUp,
  updateProfile,
  verifyEmail,
} from '@/modules/customers'
import { editor, superAdmin } from '@/test/actors'

let ipCounter = 0
/** A fresh IP per call, so the per-IP limits only bite where a test wants them to. */
const info = (ip = `10.9.0.${++ipCounter}`) => ({ ipKey: ip, ipHash: 'h', userAgent: 'vitest' })
const PASSWORD = 'harbour-lights-2026'

async function newAccount(email: string, password = PASSWORD) {
  const result = await signUp({ name: 'Layla Haddad', email, phone: '', password }, info())
  if (!result.ok) throw new Error(result.error)
  const actor = await customerFromSessionToken(result.token)
  if (!actor) throw new Error('no session')
  return { ...result, actor }
}

/** The one-time token in the newest account email to `to` (read straight from the outbox). */
async function tokenFromEmail(to: string) {
  const email = await prisma.emailOutbox.findFirstOrThrow({
    where: { to },
    orderBy: { createdAt: 'desc' },
  })
  return /token=([\w-]+)/.exec(email.text)![1]
}

let propertyId: string
let projectId: string

beforeAll(async () => {
  await ensureReady()
  propertyId = (
    await prisma.property.findFirstOrThrow({ where: { publicationStatus: 'PUBLISHED' } })
  ).id
  projectId = (await prisma.project.findFirstOrThrow({ where: { publicationStatus: 'PUBLISHED' } }))
    .id
})

describe('domain rules', () => {
  it('only accepts on-site return paths, never the admin or another host', () => {
    expect(safeNextPath('/buy?type=Villa')).toBe('/buy?type=Villa')
    expect(safeNextPath('/properties/a-b#gallery')).toBe('/properties/a-b#gallery')
    for (const bad of [
      '//evil.com',
      '/\\evil.com',
      'https://evil.com',
      '/admin',
      '/admin/users',
      '/api/x',
      'buy',
      '',
      null,
    ]) {
      expect(safeNextPath(bad)).toBe('/account')
    }
  })

  it('parses saved-item keys strictly', () => {
    expect(parseFavoriteKey('PROPERTY:cm1abcdefgh')).toEqual({
      type: 'PROPERTY',
      id: 'cm1abcdefgh',
    })
    expect(parseFavoriteKey('PROJECT:cm1abcdefgh')?.type).toBe('PROJECT')
    for (const bad of ['USER:cm1abcdefgh', 'PROPERTY:', 'PROPERTY:../x', 'PROPERTY:a', 42]) {
      expect(parseFavoriteKey(bad)).toBeNull()
    }
  })

  it('keeps account CSRF tokens apart from admin ones', () => {
    const token = csrfTokenFor('session-x', 'account')
    expect(token).not.toBe(csrfTokenFor('session-x'))
    expect(csrfValid('session-x', token, 'account')).toBe(true)
    expect(csrfValid('session-x', token)).toBe(false)
  })
})

describe('sign up and sign in', () => {
  it('creates a working account, Argon2id hash, unconfirmed email, confirmation queued', async () => {
    const { actor, customerId } = await newAccount('Layla@Example.com ')
    expect(actor.email).toBe('layla@example.com')
    expect(actor.emailVerified).toBe(false)
    const row = await prisma.customer.findUniqueOrThrow({ where: { id: customerId } })
    expect(row.passwordHash).toMatch(/^\$argon2id\$/)
    const email = await prisma.emailOutbox.findFirstOrThrow({ where: { to: 'layla@example.com' } })
    expect(email.subject).toMatch(/Confirm your email/)
    expect(email.text).toMatch(/\/account\/verify\?token=/)
    // The session row stores only the hash of the cookie token.
    expect(await prisma.customerSession.count({ where: { customerId } })).toBe(1)
  })

  it('rejects weak passwords, bad fields and a taken email', async () => {
    const weak = await signUp({ name: 'A B', email: 'w@example.com', password: 'short' }, info())
    expect(weak).toMatchObject({ ok: false, fields: { password: expect.any(String) } })
    const bad = await signUp({ name: 'A', email: 'nope', password: PASSWORD }, info())
    expect(bad).toMatchObject({
      ok: false,
      fields: { name: expect.any(String), email: expect.any(String) },
    })
    await newAccount('taken@example.com')
    const taken = await signUp(
      { name: 'Other', email: 'TAKEN@example.com', password: PASSWORD },
      info(),
    )
    expect(taken).toMatchObject({ ok: false, fields: { email: expect.any(String) } })
  })

  it('limits sign-ups per IP', async () => {
    const ip = info('10.8.8.8')
    for (let i = 0; i < 5; i++) {
      const r = await signUp(
        { name: 'Rate Test', email: `rate${i}@example.com`, password: PASSWORD },
        ip,
      )
      expect(r.ok).toBe(true)
    }
    const blocked = await signUp(
      { name: 'Rate Test', email: 'rate9@example.com', password: PASSWORD },
      ip,
    )
    expect(blocked).toMatchObject({ ok: false, error: expect.stringMatching(/Too many/) })
  })

  it('signs in case-insensitively with the same message for unknown email and wrong password', async () => {
    await newAccount('signin@example.com')
    expect((await signIn({ email: 'SIGNIN@example.com', password: PASSWORD }, info())).ok).toBe(
      true,
    )
    const wrong = await signIn(
      { email: 'signin@example.com', password: 'not-the-password' },
      info(),
    )
    const unknown = await signIn({ email: 'ghost@example.com', password: PASSWORD }, info())
    expect(wrong).toEqual({ ok: false, error: 'Wrong email or password.' })
    expect(unknown).toEqual(wrong)
  })

  it('locks the account after repeated wrong passwords', async () => {
    await newAccount('lock@example.com')
    for (let i = 0; i < MAX_FAILED_SIGNINS; i++) {
      await signIn({ email: 'lock@example.com', password: 'wrong-password-123' }, info())
    }
    const locked = await signIn({ email: 'lock@example.com', password: PASSWORD }, info())
    expect(locked).toMatchObject({ ok: false, error: expect.stringMatching(/Too many attempts/) })
  })

  it('signs out by deleting the session', async () => {
    const { actor, token } = await newAccount('out@example.com')
    await signOut(actor, null)
    expect(await customerFromSessionToken(token)).toBeNull()
  })

  it('never accepts an account token as an admin session or the other way round', async () => {
    const { token } = await newAccount('separate@example.com')
    const { actorFromSessionToken } = await import('@/modules/users')
    expect(await actorFromSessionToken(token)).toBeNull()
    expect(await prisma.session.findUnique({ where: { id: hashSessionToken(token) } })).toBeNull()
  })
})

describe('email confirmation and password reset', () => {
  it('confirms the email once from the emailed link', async () => {
    const { actor } = await newAccount('verify@example.com')
    const token = await tokenFromEmail('verify@example.com')
    expect(await verifyEmail(token)).toEqual({ ok: true })
    expect(
      (await prisma.customer.findUniqueOrThrow({ where: { id: actor.id } })).emailVerifiedAt,
    ).not.toBeNull()
    expect((await verifyEmail(token)).ok).toBe(false)
    expect((await verifyEmail('made-up-token-made-up-token')).ok).toBe(false)
  })

  it('limits confirmation re-sends', async () => {
    const { actor } = await newAccount('resend@example.com')
    expect(await resendVerification(actor)).toEqual({ ok: true })
    expect(await resendVerification(actor)).toEqual({ ok: true })
    // the sign-up email + 2 re-sends = 3 in the hour
    expect((await resendVerification(actor)).ok).toBe(false)
  })

  it('resets the password with a single-use link and ends every other session', async () => {
    const { token: oldSession } = await newAccount('reset@example.com')
    await requestPasswordReset('RESET@example.com', info())
    const link = await tokenFromEmail('reset@example.com')
    expect(await resetTokenUsable(link)).toBe(true)

    const weak = await resetPassword(link, 'short', info())
    expect(weak.ok).toBe(false)
    const done = await resetPassword(link, 'a-brand-new-passphrase', info())
    expect(done.ok).toBe(true)
    expect(await customerFromSessionToken(oldSession)).toBeNull()
    expect(await resetTokenUsable(link)).toBe(false)
    expect((await resetPassword(link, 'another-new-passphrase', info())).ok).toBe(false)
    expect(
      (await signIn({ email: 'reset@example.com', password: 'a-brand-new-passphrase' }, info())).ok,
    ).toBe(true)
  })

  it('answers a reset request for an unknown email without queueing anything', async () => {
    const before = await prisma.emailOutbox.count()
    await requestPasswordReset('nobody-here@example.com', info())
    expect(await prisma.emailOutbox.count()).toBe(before)
  })

  it('never shows one-time links in the admin outbox', async () => {
    await newAccount('outbox@example.com')
    const { rows } = await listOutbox(superAdmin(), {})
    const row = rows.find((r) => r.to === 'outbox@example.com')!
    expect(row.text).toMatch(/token=\[hidden\]/)
    expect(row.text).not.toMatch(/token=[\w-]{20,}/)
  })
})

describe('profile, password and deletion', () => {
  it('updates name and phone with validation', async () => {
    const { actor } = await newAccount('profile@example.com')
    expect(await updateProfile(actor, { name: 'Layla H.', phone: '+971 50 123 4567' })).toEqual({
      ok: true,
    })
    expect((await updateProfile(actor, { name: 'L', phone: 'abc' })).ok).toBe(false)
    const row = await prisma.customer.findUniqueOrThrow({ where: { id: actor.id } })
    expect(row).toMatchObject({ name: 'Layla H.', phone: '+971 50 123 4567' })
  })

  it('changes the password only with the current one, rotating the session', async () => {
    const { actor, token } = await newAccount('change@example.com')
    expect(
      (
        await changePassword(
          actor,
          { current: 'nope-nope-nope', next: 'x-new-passphrase-1' },
          info(),
        )
      ).ok,
    ).toBe(false)
    const changed = await changePassword(
      actor,
      { current: PASSWORD, next: 'x-new-passphrase-1' },
      info(),
    )
    expect(changed.ok).toBe(true)
    expect(await customerFromSessionToken(token)).toBeNull()
  })

  it('deletes the account and its data, keeping the request for the company', async () => {
    const { actor } = await newAccount('delete@example.com')
    await setFavorite(actor.id, `PROPERTY:${propertyId}`, true)
    const inquiry = await submitInquiry(
      {
        type: 'CONSULTATION',
        name: 'Layla',
        phone: '+971501234567',
        email: 'delete@example.com',
        interest: 'Villa',
        notes: '',
      },
      { ipHash: null, userAgent: null, customerId: actor.id },
    )
    expect((await deleteAccount(actor, 'wrong-password-1', info())).ok).toBe(false)
    expect(await deleteAccount(actor, PASSWORD, info())).toEqual({ ok: true })
    expect(await prisma.customer.findUnique({ where: { id: actor.id } })).toBeNull()
    expect(await prisma.favorite.count({ where: { customerId: actor.id } })).toBe(0)
    expect(await prisma.customerSession.count({ where: { customerId: actor.id } })).toBe(0)
    expect(await prisma.customerToken.count({ where: { customerId: actor.id } })).toBe(0)
    expect(await prisma.customerInquiry.count({ where: { customerId: actor.id } })).toBe(0)
    expect(await prisma.inquiry.findUnique({ where: { id: inquiry.id } })).not.toBeNull()
  })
})

describe('saved items', () => {
  it('saves and removes published properties and projects', async () => {
    const { actor } = await newAccount('saver@example.com')
    expect(await setFavorite(actor.id, `PROPERTY:${propertyId}`, true)).toEqual({
      ok: true,
      saved: true,
    })
    expect(await setFavorite(actor.id, `PROPERTY:${propertyId}`, true)).toEqual({
      ok: true,
      saved: true,
    })
    expect(await setFavorite(actor.id, `PROJECT:${projectId}`, true)).toEqual({
      ok: true,
      saved: true,
    })
    expect(await listFavoriteKeys(actor.id)).toEqual([
      `PROJECT:${projectId}`,
      `PROPERTY:${propertyId}`,
    ])

    const items = await listFavoriteItems(actor.id)
    expect(items.properties.map((p) => p.id)).toEqual([propertyId])
    expect(items.projects.map((p) => p.id)).toEqual([projectId])

    expect(await setFavorite(actor.id, `PROPERTY:${propertyId}`, false)).toEqual({
      ok: true,
      saved: false,
    })
    expect(await listFavoriteKeys(actor.id)).toEqual([`PROJECT:${projectId}`])
  })

  it('refuses drafts and unknown ids, and hides items unpublished after saving', async () => {
    const { actor } = await newAccount('drafts@example.com')
    const draft = await prisma.property.findFirstOrThrow({
      where: { publicationStatus: 'PUBLISHED' },
      skip: 1,
    })
    expect((await setFavorite(actor.id, 'PROPERTY:doesnotexist123', true)).ok).toBe(false)
    expect((await setFavorite(actor.id, 'nonsense', true)).ok).toBe(false)

    expect((await setFavorite(actor.id, `PROPERTY:${draft.id}`, true)).ok).toBe(true)
    await prisma.property.update({ where: { id: draft.id }, data: { publicationStatus: 'DRAFT' } })
    const items = await listFavoriteItems(actor.id)
    expect(items.properties).toEqual([])
    expect(items.unavailable).toBe(1)
    expect((await setFavorite(actor.id, `PROPERTY:${draft.id}`, true)).ok).toBe(false)
    // Removing still works after unpublishing.
    expect((await setFavorite(actor.id, `PROPERTY:${draft.id}`, false)).ok).toBe(true)
    await prisma.property.update({
      where: { id: draft.id },
      data: { publicationStatus: 'PUBLISHED' },
    })
  })
})

describe('requests on the account page', () => {
  it('lists only the requests sent while signed in, without internal fields', async () => {
    const { actor } = await newAccount('requests@example.com')
    const base = {
      type: 'PROPERTY_INQUIRY' as const,
      name: 'Layla',
      phone: '+971501234567',
      email: 'requests@example.com',
      interest: 'Viewing',
      notes: 'Weekend please',
    }
    await submitInquiry(
      { ...base, context: 'LL-BUY-148' },
      { ipHash: 'x', userAgent: 'ua', customerId: actor.id },
    )
    await submitInquiry(base, { ipHash: null, userAgent: null }) // not signed in: not linked
    const list = await listCustomerInquiries(actor.id)
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({
      type: 'Viewing request',
      context: 'LL-BUY-148',
      status: 'Received',
    })
    expect(Object.keys(list[0]).sort()).toEqual([
      'context',
      'createdAt',
      'id',
      'interest',
      'status',
      'type',
    ])
  })
})

describe('admin: website accounts', () => {
  it('needs customer.view to list and customer.manage to deactivate (editors have neither)', async () => {
    await expect(listCustomers(editor())).rejects.toBeInstanceOf(ForbiddenError)
    const { actor, token } = await newAccount('managed@example.com')
    await expect(setCustomerActive(editor(), actor.id, false)).rejects.toBeInstanceOf(
      ForbiddenError,
    )

    const list = await listCustomers(superAdmin(), { q: 'managed@' })
    expect(list.rows.map((r) => r.email)).toEqual(['managed@example.com'])
    expect(list.rows[0]).not.toHaveProperty('passwordHash')

    expect(await setCustomerActive(superAdmin(), actor.id, false)).toEqual({ ok: true })
    expect(await customerFromSessionToken(token)).toBeNull()
    expect((await signIn({ email: 'managed@example.com', password: PASSWORD }, info())).ok).toBe(
      false,
    )
    await setCustomerActive(superAdmin(), actor.id, true)
    expect((await signIn({ email: 'managed@example.com', password: PASSWORD }, info())).ok).toBe(
      true,
    )
  })
})
