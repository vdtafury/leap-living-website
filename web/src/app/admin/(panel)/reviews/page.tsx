import Link from 'next/link'
import { csrfToken, requireActor } from '@/server/auth/current'
import { can } from '@/modules/authorization'
import {
  listReviews,
  REAL_REVIEWS_TO_HIDE_SAMPLES,
  REVIEW_STATUSES,
  type ReviewStatus,
} from '@/modules/reviews'
import { reviewAction } from '../../actions'
import { SubmitButton } from '../../_components/client'
import {
  Badge,
  CsrfInput,
  Flash,
  PageHead,
  param,
  When,
  type SearchParams,
} from '../../_components/ui'

export const metadata = { title: 'Client reviews' }

const STATUS_LABEL: Record<ReviewStatus, string> = {
  PENDING: 'Waiting',
  APPROVED: 'Published',
  REJECTED: 'Hidden',
}
const BADGE: Record<ReviewStatus, string> = {
  PENDING: 'PENDING',
  APPROVED: 'ok',
  REJECTED: 'muted',
}

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

/** Client reviews from website accounts (D-44): nothing is public until approved here. */
export default async function ReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireActor('review.view')
  const query = await searchParams
  const requested = param(query.status)
  // Default view: what needs a decision. Restrict to known filter values.
  const current =
    requested === 'all' || (REVIEW_STATUSES as readonly string[]).includes(requested)
      ? requested
      : 'PENDING'
  const status = current === 'all' ? '' : current
  const { rows, counts } = await listReviews(actor, { status })
  const csrf = csrfToken(actor)
  const moderate = can(actor, 'review.moderate')
  const back = `/admin/reviews?status=${encodeURIComponent(current)}`
  const total = REVIEW_STATUSES.reduce((a, s) => a + counts[s], 0)
  const tabs: { key: string; label: string; count: number }[] = [
    ...REVIEW_STATUSES.map((s) => ({ key: s, label: STATUS_LABEL[s], count: counts[s] })),
    { key: 'all', label: 'All', count: total },
  ]

  return (
    <>
      <PageHead
        title="Client reviews"
        description={`Reviews written from website accounts. A review appears on the homepage only after it is approved; the sample reviews stay until ${REAL_REVIEWS_TO_HIDE_SAMPLES} real reviews are published. Approving does not change the wording.`}
      />
      <Flash ok={param(query.ok)} error={param(query.error)} />

      <div className="adm-card">
        <nav className="adm-filters" aria-label="Review status">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin/reviews?status=${t.key}`}
              className={`adm-btn adm-btn-sm ${current === t.key ? '' : 'adm-btn-ghost'}`}
              aria-current={current === t.key ? 'page' : undefined}
            >
              {t.label} <span className="tabular-nums">({t.count})</span>
            </Link>
          ))}
        </nav>
      </div>

      {rows.length === 0 ? (
        <div className="adm-card">
          <p className="adm-empty">
            {current === 'PENDING' ? 'No reviews waiting for approval.' : 'No reviews here.'}
          </p>
        </div>
      ) : (
        rows.map((r) => {
          const s = r.status as ReviewStatus
          return (
            <article key={r.id} className="adm-card adm-review">
              <div className="adm-review-head">
                <span className="adm-review-stars" aria-label={`${r.rating} out of 5 stars`}>
                  {stars(r.rating)}
                </span>
                <Badge value={BADGE[s] ?? 'muted'} label={STATUS_LABEL[s] ?? s} />
                <span className="adm-sub">
                  Sent <When date={r.updatedAt} />
                  {r.reviewedAt && (
                    <>
                      {' '}
                      · {s === 'APPROVED' ? 'approved' : 'hidden'} <When date={r.reviewedAt} />
                      {r.reviewedBy && ` by ${r.reviewedBy}`}
                    </>
                  )}
                </span>
              </div>
              <h2 className="adm-review-title">{r.title}</h2>
              <p className="adm-review-body">{r.body}</p>
              <div className="adm-review-by">
                <strong>{r.displayName}</strong>
                {r.role && <span> · {r.role}</span>}
                <span className="adm-sub"> (shown on the website) · picture: {r.avatar}</span>
              </div>
              <div className="adm-sub">
                Account:{' '}
                {r.customer ? (
                  <>
                    {r.customer.name} · {r.customer.email}{' '}
                    {r.customer.emailVerifiedAt ? '(email confirmed)' : '(email not confirmed)'}
                    {!r.customer.isActive && ' · account deactivated, not shown'}
                  </>
                ) : (
                  'deleted'
                )}
              </div>
              {moderate && (
                <form action={reviewAction} className="adm-actions adm-review-actions">
                  <CsrfInput token={csrf} />
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="back" value={back} />
                  {s !== 'APPROVED' && (
                    <SubmitButton className="adm-btn adm-btn-sm" name="op" value="approve">
                      Approve and publish
                    </SubmitButton>
                  )}
                  {s !== 'REJECTED' && (
                    <SubmitButton
                      className="adm-btn adm-btn-ghost adm-btn-sm"
                      name="op"
                      value="reject"
                    >
                      {s === 'APPROVED' ? 'Unpublish' : 'Hide'}
                    </SubmitButton>
                  )}
                  <SubmitButton
                    className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-danger"
                    name="op"
                    value="delete"
                    confirm={`Delete the review by ${r.displayName} for good? The client can write a new one.`}
                  >
                    Delete
                  </SubmitButton>
                </form>
              )}
            </article>
          )
        })
      )}
    </>
  )
}
