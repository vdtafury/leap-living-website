import { z } from 'zod'

// No runtime code generation (CSP has no 'unsafe-eval'), as in the other modules.
z.config({ jitless: true })

/**
 * Client reviews (D-44): pure rules, no I/O. Written from a website account, published only
 * after the team approves them; the homepage keeps the sample reviews (5 stars) until enough
 * real ones are published.
 */

export const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

export const REVIEW_AVATARS = ['man', 'woman'] as const
export type ReviewAvatar = (typeof REVIEW_AVATARS)[number]

/** From this many published reviews on, the sample reviews are no longer shown. */
export const REAL_REVIEWS_TO_HIDE_SAMPLES = 3
/**
 * Reviews sent to the homepage at most (newest approved first). The wall renders the first
 * six and "Show more reviews" adds six at a time (owner, 2026-11-18), so only what the
 * visitor asks for is in the page.
 */
export const HOMEPAGE_REVIEW_LIMIT = 30
/** Stars shown on the sample reviews until real ones replace them (owner, 2026-11-18). */
export const SAMPLE_RATING = 5

const oneLine = (max: number, min: number, minMessage: string) =>
  z
    .string()
    .transform((v) => v.replace(/\s+/g, ' ').trim())
    .pipe(z.string().min(min, minMessage).max(max, `Use at most ${max} characters.`))

export const reviewInputSchema = z.object({
  rating: z.coerce
    .number({ error: 'Choose from 1 to 5 stars.' })
    .int('Choose from 1 to 5 stars.')
    .min(1, 'Choose from 1 to 5 stars.')
    .max(5, 'Choose from 1 to 5 stars.'),
  title: oneLine(80, 4, 'Give your review a short headline.'),
  body: z
    .string()
    // Keep paragraphs, drop runs of blank lines and trailing spaces.
    .transform((v) =>
      v
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim(),
    )
    .pipe(
      z
        .string()
        .min(30, 'Tell us a little more (at least 30 characters).')
        .max(700, 'Use at most 700 characters.'),
    ),
  role: z
    .string()
    .default('')
    .transform((v) => v.replace(/\s+/g, ' ').trim())
    .pipe(z.string().max(60, 'Use at most 60 characters.')),
  avatar: z.enum(REVIEW_AVATARS, { error: 'Choose a picture.' }),
})
export type ReviewInput = z.input<typeof reviewInputSchema>

/**
 * The name shown with a review: first name and the initial of the last name ("Sara Khan" →
 * "Sara K."). A visitor's full name is personal data and is never published.
 */
export function reviewDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Client'
  const first = parts[0].slice(0, 40)
  const last = parts.length > 1 ? parts[parts.length - 1] : ''
  const initial = last ? last.charAt(0).toLocaleUpperCase('en') : ''
  return initial ? `${first} ${initial}.` : first
}

export interface HomepageReview {
  avatar: ReviewAvatar
  title: string
  quote: string
  author: string
  role: string
  rating: number
}

/** Totals of the published reviews; `byRating[n - 1]` = how many gave n stars. */
export interface ReviewStats {
  count: number
  ratingSum: number
  byRating: [number, number, number, number, number]
}

export const EMPTY_REVIEW_STATS: ReviewStats = { count: 0, ratingSum: 0, byRating: [0, 0, 0, 0, 0] }

export interface ReviewSummary {
  average: number
  count: number
  /** 5 stars first, as on the big review sites */
  breakdown: { stars: number; count: number }[]
}

/**
 * What the homepage shows: published reviews first (newest first); the samples fill in only
 * while fewer than REAL_REVIEWS_TO_HIDE_SAMPLES real reviews are published. The summary
 * (average, count and star breakdown of all published reviews) is shown only from that point,
 * never for samples.
 */
export function homepageReviews(
  published: HomepageReview[],
  samples: Omit<HomepageReview, 'rating'>[],
  stats: ReviewStats,
): { items: HomepageReview[]; summary: ReviewSummary | null } {
  const enough = stats.count >= REAL_REVIEWS_TO_HIDE_SAMPLES
  const real = published.slice(0, HOMEPAGE_REVIEW_LIMIT)
  const items = enough
    ? real
    : [...real, ...samples.map((s) => ({ ...s, rating: SAMPLE_RATING }))].slice(
        0,
        HOMEPAGE_REVIEW_LIMIT,
      )
  const summary = enough
    ? {
        average: Math.round((stats.ratingSum / stats.count) * 10) / 10,
        count: stats.count,
        breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: stats.byRating[stars - 1] })),
      }
    : null
  return { items, summary }
}
