import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { accountCsrfToken, getCustomer } from '@/server/auth/account'
import { getCustomerReview, reviewDisplayName } from '@/modules/reviews'
import { ReviewForm } from '@/components/account/account-forms'
import { ChevronRightIcon } from '@/components/ui/icons'
import { Stars } from '@/components/ui/stars'

export const metadata: Metadata = { title: 'Share your experience | LEAP LIVING' }

type Search = Promise<Record<string, string | string[] | undefined>>

const STATUS_TEXT = {
  PENDING: {
    label: 'Waiting for approval',
    text: 'Our team reads every review before it appears on the website. You can still change it.',
  },
  APPROVED: {
    label: 'Published',
    text: 'Your review is on our homepage. If you change it, it is hidden until our team approves the new version.',
  },
  REJECTED: {
    label: 'Not published',
    text: 'Our team did not publish this review. You can change it and send it again.',
  },
} as const

/** Client review (D-44): signed-in accounts only, published after the team approves it. */
export default async function ReviewPage({ searchParams }: { searchParams: Search }) {
  const customer = await getCustomer()
  if (!customer) redirect('/account/sign-in?next=/account/review')
  const [review, query] = await Promise.all([getCustomerReview(customer.id), searchParams])
  const csrf = accountCsrfToken(customer)
  const status = review ? STATUS_TEXT[review.status as keyof typeof STATUS_TEXT] : null

  return (
    <>
      <section className="ll-acc-hero">
        <div className="ll-container">
          <div className="ll-acc-crumbs">
            <Link href="/account">My account</Link>
            <ChevronRightIcon size={13} />
            <span>Review</span>
          </div>
          <h1 className="ll-acc-hero-title">Share your experience</h1>
          <p className="ll-acc-hero-sub">
            Tell other buyers, sellers and investors what working with Leap Living was like.
          </p>
        </div>
      </section>

      <div className="ll-container ll-acc-body ll-review-page">
        <div className="ll-review-main">
          {query.sent === '1' && (
            <div className="ll-acc-alert ll-acc-alert--ok" role="status">
              Thank you. Your review is with our team and appears on the website once approved.
            </div>
          )}

          {review && status && (
            <section
              className={`ll-review-status ll-review-status--${review.status.toLowerCase()}`}
              aria-labelledby="review-status-title"
            >
              <div className="ll-review-status-head">
                <span className="ll-review-status-chip">{status.label}</span>
                <Stars rating={review.rating} size={15} />
              </div>
              <h2 id="review-status-title" className="ll-review-status-title">
                {review.title}
              </h2>
              <p className="ll-review-status-text">{status.text}</p>
            </section>
          )}

          <section className="ll-acc-panel" aria-labelledby="review-form-title">
            <h2 id="review-form-title">{review ? 'Change your review' : 'Write your review'}</h2>
            <p className="ll-acc-panel-lead">
              {review
                ? 'Sending a new version replaces the one above.'
                : 'It takes about two minutes.'}
            </p>
            <ReviewForm
              csrf={csrf}
              shownAs={reviewDisplayName(customer.name)}
              initial={
                review
                  ? {
                      rating: review.rating,
                      title: review.title,
                      body: review.body,
                      role: review.role,
                      avatar: review.avatar,
                    }
                  : null
              }
            />
          </section>
        </div>

        <aside className="ll-review-aside" aria-label="How reviews work">
          <h2>How reviews work</h2>
          <ol>
            <li>
              <strong>One review per account.</strong> You can change it at any time.
            </li>
            <li>
              <strong>Our team reads it first.</strong> Nothing appears on the website before it is
              approved.
            </li>
            <li>
              <strong>We never edit your words.</strong> We decline reviews with personal details,
              offensive language or advertising.
            </li>
            <li>
              <strong>Your privacy.</strong> We show your first name and initial only. Deleting your
              account deletes your review.
            </li>
          </ol>
        </aside>
      </div>
    </>
  )
}
