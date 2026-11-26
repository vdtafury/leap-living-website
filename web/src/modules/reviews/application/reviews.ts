import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { createRateLimiter } from '@/server/rate-limit'
import { SITE_URL } from '@/lib/seo'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import { getPublishedContent } from '@/modules/content'
import { notificationRecipients, processOutbox, queueEmail } from '@/modules/inquiries'
import {
  HOMEPAGE_REVIEW_LIMIT,
  REVIEW_STATUSES,
  reviewDisplayName,
  reviewInputSchema,
  type HomepageReview,
  type ReviewAvatar,
  type ReviewInput,
  type ReviewStatus,
  EMPTY_REVIEW_STATS,
  type ReviewStats,
} from '../domain/review'

/** The signed-in website account writing a review (a subset of CustomerActor). */
export interface ReviewAuthor {
  id: string
  name: string
  email: string
}

/** Saving a review (new or edited) at most this often per account. */
const savesPerAccount = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })

const firstIssues = (issues: { path: PropertyKey[]; message: string }[]) => {
  const out: Record<string, string> = {}
  for (const issue of issues) out[String(issue.path[0] ?? 'form')] ??= issue.message
  return out
}

const oneLine = (value: string, max = 120) =>
  value
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max)

const REVIEW_SELECT = {
  id: true,
  rating: true,
  title: true,
  body: true,
  role: true,
  avatar: true,
  displayName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
} as const

/** The account's own review (any status), for /account/review. */
export async function getCustomerReview(customerId: string) {
  await ensureReady()
  return prisma.review.findUnique({ where: { customerId }, select: REVIEW_SELECT })
}

/**
 * Saves the account's review and puts it in the approval queue. One review per account:
 * writing again replaces the text and it waits for approval again (so an approved review
 * that is edited is hidden until the team approves the new text). The team notification is
 * queued in the same transaction (saved before notifying).
 */
export async function submitReview(
  author: ReviewAuthor,
  input: ReviewInput,
): Promise<
  { ok: true; status: ReviewStatus } | { ok: false; error: string; fields?: Record<string, string> }
> {
  await ensureReady()
  const parsed = reviewInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Check the highlighted fields.',
      fields: firstIssues(parsed.error.issues),
    }
  }
  if (!savesPerAccount.hit(author.id).ok) {
    return { ok: false, error: 'You have edited your review several times. Try again in an hour.' }
  }
  const data = {
    ...parsed.data,
    displayName: reviewDisplayName(author.name),
    status: 'PENDING' as const,
    reviewedAt: null,
    reviewedById: null,
  }
  const settings = await getPublishedContent('settings')
  const to = notificationRecipients() ?? settings.company.email
  const saved = await prisma.$transaction(async (tx) => {
    const account = await tx.customer.findUnique({
      where: { id: author.id },
      select: { isActive: true },
    })
    if (!account?.isActive) return false
    const existing = await tx.review.findUnique({
      where: { customerId: author.id },
      select: { id: true },
    })
    const review = await tx.review.upsert({
      where: { customerId: author.id },
      create: { customerId: author.id, ...data },
      update: data,
      select: { id: true },
    })
    await queueEmail(
      {
        to,
        subject: oneLine(
          `${existing ? 'Edited review' : 'New review'} to approve: ${data.displayName}`,
        ),
        text: [
          `${existing ? 'A client edited their review' : 'A client wrote a review'} on the website. It is not published until someone approves it.`,
          '',
          `Stars: ${data.rating} / 5`,
          `Headline: ${oneLine(data.title)}`,
          `Shown as: ${data.displayName}${data.role ? ` · ${oneLine(data.role)}` : ''}`,
          `Account: ${oneLine(author.email)}`,
          '',
          data.body,
          '',
          `Approve or hide it: ${SITE_URL}/admin/reviews`,
        ].join('\n'),
        relatedType: 'Review',
        relatedId: review.id,
      },
      tx,
    )
    return true
  })
  if (!saved) return { ok: false, error: 'Your account is not active.' }
  processOutbox().catch((error) => console.error('[outbox] send after review failed', error))
  return { ok: true, status: 'PENDING' }
}

/**
 * Approved reviews for the homepage, newest approval first, from accounts that are still
 * active (a deactivated account's review disappears with it). Plus the totals for the summary.
 */
export async function listPublishedReviews(): Promise<{
  items: HomepageReview[]
  stats: ReviewStats
}> {
  await ensureReady()
  const rows = await prisma.review.findMany({
    where: { status: 'APPROVED' },
    orderBy: { reviewedAt: 'desc' },
    select: {
      customerId: true,
      rating: true,
      title: true,
      body: true,
      role: true,
      avatar: true,
      displayName: true,
    },
  })
  if (rows.length === 0) return { items: [], stats: EMPTY_REVIEW_STATS }
  const active = new Set(
    (
      await prisma.customer.findMany({
        where: { id: { in: rows.map((r) => r.customerId) }, isActive: true },
        select: { id: true },
      })
    ).map((c) => c.id),
  )
  const visible = rows.filter((r) => active.has(r.customerId))
  return {
    items: visible.slice(0, HOMEPAGE_REVIEW_LIMIT).map((r) => ({
      avatar: (r.avatar === 'woman' ? 'woman' : 'man') as ReviewAvatar,
      title: r.title,
      quote: r.body,
      author: r.displayName,
      role: r.role,
      rating: r.rating,
    })),
    stats: {
      count: visible.length,
      ratingSum: visible.reduce((a, r) => a + r.rating, 0),
      byRating: [1, 2, 3, 4, 5].map(
        (n) => visible.filter((r) => r.rating === n).length,
      ) as ReviewStats['byRating'],
    },
  }
}

/** /admin/reviews: newest first, filtered by status, with the account behind each review. */
export async function listReviews(actor: Actor, { status }: { status?: string } = {}) {
  authorize(actor, 'review.view')
  await ensureReady()
  const filter = REVIEW_STATUSES.includes(status as ReviewStatus)
    ? (status as ReviewStatus)
    : undefined
  const [rows, grouped] = await Promise.all([
    prisma.review.findMany({
      where: filter ? { status: filter } : {},
      orderBy: { updatedAt: 'desc' },
      take: 200,
      select: { ...REVIEW_SELECT, customerId: true, reviewedById: true },
    }),
    prisma.review.groupBy({ by: ['status'], _count: { _all: true } }),
  ])
  const [customers, reviewers] = await Promise.all([
    prisma.customer.findMany({
      where: { id: { in: rows.map((r) => r.customerId) } },
      select: { id: true, name: true, email: true, emailVerifiedAt: true, isActive: true },
    }),
    prisma.user.findMany({
      where: { id: { in: rows.map((r) => r.reviewedById).filter((v): v is string => Boolean(v)) } },
      select: { id: true, name: true },
    }),
  ])
  const byCustomer = new Map(customers.map((c) => [c.id, c]))
  const byReviewer = new Map(reviewers.map((u) => [u.id, u.name]))
  const counts = Object.fromEntries(REVIEW_STATUSES.map((s) => [s, 0])) as Record<
    ReviewStatus,
    number
  >
  for (const g of grouped) if (g.status in counts) counts[g.status as ReviewStatus] = g._count._all
  return {
    rows: rows.map((r) => ({
      ...r,
      customer: byCustomer.get(r.customerId) ?? null,
      reviewedBy: r.reviewedById ? (byReviewer.get(r.reviewedById) ?? null) : null,
    })),
    counts,
    filter: filter ?? null,
  }
}

export async function countPendingReviews(actor: Actor): Promise<number> {
  authorize(actor, 'review.view')
  await ensureReady()
  return prisma.review.count({ where: { status: 'PENDING' } })
}

export type ModerationOp = 'approve' | 'reject' | 'delete'

/** Approve (publish), hide (reject) or delete a review. Audited. */
export async function moderateReview(
  actor: Actor,
  id: string,
  op: ModerationOp,
): Promise<{ ok: true } | { ok: false; error: string }> {
  authorize(actor, 'review.moderate')
  if (!['approve', 'reject', 'delete'].includes(op)) return { ok: false, error: 'Unknown action.' }
  await ensureReady()
  const ok = await prisma.$transaction(async (tx) => {
    const review = await tx.review.findUnique({
      where: { id },
      select: { id: true, rating: true },
    })
    if (!review) return false
    if (op === 'delete') {
      await tx.review.delete({ where: { id } })
    } else {
      await tx.review.update({
        where: { id },
        data: {
          status: op === 'approve' ? 'APPROVED' : 'REJECTED',
          reviewedAt: new Date(),
          reviewedById: actor.id,
        },
      })
    }
    await recordAudit(
      {
        actor,
        action: `review.${op === 'approve' ? 'approved' : op === 'reject' ? 'hidden' : 'deleted'}`,
        targetType: 'Review',
        targetId: id,
        metadata: { rating: review.rating },
      },
      tx,
    )
    return true
  })
  if (!ok) return { ok: false, error: 'Review not found. It may have been deleted.' }
  return { ok: true }
}

type ReviewClient = Pick<typeof prisma, 'review'>

/** Account deletion: the review goes with the account (inside the caller's transaction). */
export async function deleteCustomerReview(customerId: string, db: ReviewClient = prisma) {
  await db.review.deleteMany({ where: { customerId } })
}
