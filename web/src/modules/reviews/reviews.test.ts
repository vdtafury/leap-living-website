import { beforeAll, describe, expect, it } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment()
})

import { vi } from 'vitest'
import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { ForbiddenError } from '@/modules/authorization'
import {
  customerFromSessionToken,
  deleteAccount,
  setCustomerActive,
  signIn,
  signUp,
} from '@/modules/customers'
import {
  getCustomerReview,
  homepageReviews,
  listPublishedReviews,
  listReviews,
  moderateReview,
  reviewDisplayName,
  reviewInputSchema,
  submitReview,
  countPendingReviews,
} from '@/modules/reviews'
import { editor, superAdmin } from '@/test/actors'

let ip = 0
const info = () => ({ ipKey: `10.7.0.${++ip}`, ipHash: 'h', userAgent: 'vitest' })
const PASSWORD = 'harbour-lights-2026'

async function newAccount(email: string, name = 'Sara Khan') {
  const result = await signUp({ name, email, phone: '', password: PASSWORD }, info())
  if (!result.ok) throw new Error(result.error)
  const actor = await customerFromSessionToken(result.token)
  if (!actor) throw new Error('no session')
  return actor
}

const GOOD = {
  rating: '5',
  title: 'Clear advice from day one',
  body: 'They explained every step of the purchase and the handover went exactly as planned.',
  role: 'Bought in Dubai Hills',
  avatar: 'woman' as const,
}

beforeAll(async () => {
  await ensureReady()
})

describe('domain rules', () => {
  it('publishes the first name and the last initial only', () => {
    expect(reviewDisplayName('Sara Khan')).toBe('Sara K.')
    expect(reviewDisplayName('  ahmed   el  sayed ')).toBe('ahmed S.')
    expect(reviewDisplayName('Layla')).toBe('Layla')
    expect(reviewDisplayName('   ')).toBe('Client')
  })

  it('validates stars, headline, text, role and picture', () => {
    expect(reviewInputSchema.safeParse(GOOD).success).toBe(true)
    const bad = reviewInputSchema.safeParse({
      rating: '6',
      title: 'Ok',
      body: 'Too short',
      role: 'x'.repeat(61),
      avatar: 'robot',
    })
    expect(bad.success).toBe(false)
    const fields = new Set(bad.error!.issues.map((i) => String(i.path[0])))
    expect(fields).toEqual(new Set(['rating', 'title', 'body', 'role', 'avatar']))
    expect(reviewInputSchema.safeParse({ ...GOOD, rating: '' }).success).toBe(false)
    expect(reviewInputSchema.safeParse({ ...GOOD, rating: '4.5' }).success).toBe(false)
  })

  it('keeps the samples (5 stars) until 3 real reviews are published, no summary before', () => {
    const sample = { avatar: 'man' as const, title: 's', quote: 'q', author: 'A', role: 'r' }
    const real = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ ...sample, author: `R${i}`, rating: 4 }))
    const two = homepageReviews(real(2), [sample, sample], {
      count: 2,
      ratingSum: 8,
      byRating: [0, 0, 0, 2, 0],
    })
    expect(two.items.map((i) => i.author)).toEqual(['R0', 'R1', 'A', 'A'])
    expect(two.items[2].rating).toBe(5)
    expect(two.summary).toBeNull()
    const three = homepageReviews(real(3), [sample], {
      count: 3,
      ratingSum: 13,
      byRating: [0, 0, 0, 2, 1],
    })
    expect(three.items.map((i) => i.author)).toEqual(['R0', 'R1', 'R2'])
    expect(three.summary).toEqual({
      average: 4.3,
      count: 3,
      breakdown: [
        { stars: 5, count: 1 },
        { stars: 4, count: 2 },
        { stars: 3, count: 0 },
        { stars: 2, count: 0 },
        { stars: 1, count: 0 },
      ],
    })
  })
})

describe('writing and approving', () => {
  it('saves a review as pending, queues the team email, and never shows it before approval', async () => {
    const author = await newAccount('reviewer1@example.com')
    const result = await submitReview(author, GOOD)
    expect(result).toEqual({ ok: true, status: 'PENDING' })

    const mine = await getCustomerReview(author.id)
    expect(mine).toMatchObject({ status: 'PENDING', rating: 5, displayName: 'Sara K.' })
    const email = await prisma.emailOutbox.findFirstOrThrow({
      where: { relatedType: 'Review', relatedId: mine!.id },
    })
    expect(email.subject).toContain('New review to approve')
    expect(email.text).toContain('reviewer1@example.com')

    expect((await listPublishedReviews()).items).toHaveLength(0)
    expect(await countPendingReviews(superAdmin())).toBeGreaterThanOrEqual(1)

    expect(await moderateReview(superAdmin(), mine!.id, 'approve')).toEqual({ ok: true })
    const published = await listPublishedReviews()
    expect(published.items[0]).toMatchObject({ author: 'Sara K.', rating: 5, avatar: 'woman' })
    expect(published.stats).toEqual({ count: 1, ratingSum: 5, byRating: [0, 0, 0, 0, 1] })
    const audit = await prisma.auditLog.findFirst({
      where: { action: 'review.approved', targetId: mine!.id },
    })
    expect(audit).not.toBeNull()
  })

  it('an edited review goes back to pending and disappears until approved again', async () => {
    const author = await newAccount('reviewer2@example.com', 'Omar Haddad')
    await submitReview(author, GOOD)
    const id = (await getCustomerReview(author.id))!.id
    await moderateReview(superAdmin(), id, 'approve')
    const before = (await listPublishedReviews()).items.length

    const edited = await submitReview(author, { ...GOOD, rating: '4', title: 'Updated headline' })
    expect(edited.ok).toBe(true)
    const mine = await getCustomerReview(author.id)
    expect(mine).toMatchObject({ id, status: 'PENDING', rating: 4, reviewedAt: null })
    expect((await listPublishedReviews()).items.length).toBe(before - 1)
    expect(await prisma.review.count({ where: { customerId: author.id } })).toBe(1)
  })

  it('rejects bad input with field messages and stores nothing', async () => {
    const author = await newAccount('reviewer3@example.com')
    const result = await submitReview(author, { ...GOOD, body: 'short', rating: '0' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.fields ?? {}).sort()).toEqual(['body', 'rating'])
    expect(await getCustomerReview(author.id)).toBeNull()
  })

  it('limits how often one account can save its review', async () => {
    const author = await newAccount('reviewer4@example.com')
    for (let i = 0; i < 5; i++) expect((await submitReview(author, GOOD)).ok).toBe(true)
    const blocked = await submitReview(author, GOOD)
    expect(blocked.ok).toBe(false)
  })
})

describe('moderation and privacy', () => {
  it('only the permissions allow reading and moderating', async () => {
    await expect(listReviews(editor())).rejects.toBeInstanceOf(ForbiddenError)
    await expect(moderateReview(editor(), 'x', 'approve')).rejects.toBeInstanceOf(ForbiddenError)
    const list = await listReviews(superAdmin(), { status: 'PENDING' })
    expect(list.rows.every((r) => r.status === 'PENDING')).toBe(true)
    expect(list.rows[0]?.customer?.email).toMatch(/@example\.com$/)
    expect(await moderateReview(superAdmin(), 'missing-id', 'approve')).toMatchObject({ ok: false })
  })

  it('hidden and deleted reviews leave the homepage', async () => {
    const author = await newAccount('reviewer5@example.com', 'Nadia Farouk')
    await submitReview(author, GOOD)
    const id = (await getCustomerReview(author.id))!.id
    await moderateReview(superAdmin(), id, 'approve')
    const shown = () =>
      listPublishedReviews().then((r) => r.items.some((i) => i.author === 'Nadia F.'))
    expect(await shown()).toBe(true)
    await moderateReview(superAdmin(), id, 'reject')
    expect(await shown()).toBe(false)
    await moderateReview(superAdmin(), id, 'delete')
    expect(await getCustomerReview(author.id)).toBeNull()
  })

  it('a deactivated account is not shown; a deleted account takes its review with it', async () => {
    const author = await newAccount('reviewer6@example.com', 'Karim Mansour')
    await submitReview(author, GOOD)
    const id = (await getCustomerReview(author.id))!.id
    await moderateReview(superAdmin(), id, 'approve')
    const shown = () =>
      listPublishedReviews().then((r) => r.items.some((i) => i.author === 'Karim M.'))
    expect(await shown()).toBe(true)
    await setCustomerActive(superAdmin(), author.id, false)
    expect(await shown()).toBe(false)
    await setCustomerActive(superAdmin(), author.id, true)
    expect(await shown()).toBe(true)

    const signedIn = await signIn({ email: 'reviewer6@example.com', password: PASSWORD }, info())
    const again = signedIn.ok ? await customerFromSessionToken(signedIn.token) : null
    expect(again).not.toBeNull()
    expect(await deleteAccount(again!, PASSWORD, info())).toEqual({ ok: true })
    expect(await prisma.review.findUnique({ where: { id } })).toBeNull()
  })
})
