import Link from 'next/link'
import { CLIENT_PERSPECTIVES } from '@/data/catalog'
import { Carousel } from '@/components/ui/carousel'
import { ArrowUpRightIcon } from '@/components/ui/icons'

type Review = (typeof CLIENT_PERSPECTIVES)[number]

function QuoteMark() {
  return (
    <svg
      className="ll-review-mark"
      width="34"
      height="26"
      viewBox="0 0 34 26"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M0 26V15.6C0 6.9 4.6 1.7 13.2 0l1.4 3.6C9.7 5 7.3 7.9 7 12.3h6.5V26H0Zm19.4 0V15.6C19.4 6.9 24 1.7 32.6 0L34 3.6c-4.9 1.4-7.3 4.3-7.6 8.7h6.5V26H19.4Z"
      />
    </svg>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="ll-review">
      <QuoteMark />
      <h3 className="ll-review-title">{review.title}</h3>
      <blockquote className="ll-review-quote">
        <p>{review.quote}</p>
      </blockquote>
      <figcaption className="ll-review-author">
        <span className="ll-review-avatar" aria-hidden="true">
          {review.initials}
        </span>
        <span className="ll-review-person">
          <span className="ll-review-name">{review.author}</span>
          <span className="ll-review-role">{review.role}</span>
        </span>
      </figcaption>
    </figure>
  )
}

/**
 * Homepage client reviews (owner, 2026-11-17: Provident-style row of review cards on white,
 * replacing the one-quote glass panel). Cards are server-rendered; only the shared carousel
 * (arrows, counter, progress, swipe) runs in the browser.
 */
export function ClientExperience() {
  return (
    <section
      className="ll-section-plain ll-reviews ll-defer-render"
      aria-labelledby="ll-reviews-title"
    >
      <div className="ll-container">
        <Carousel
          className="ll-reviews-carousel"
          label="Client reviews"
          noun="review"
          nounPlural="reviews"
          action={
            <Link href="/contact" className="ll-link-arrow">
              <span className="ll-label-long">Speak With an Advisor</span>
              <span className="ll-label-short" aria-hidden="true">
                Contact
              </span>
              <ArrowUpRightIcon size={15} />
            </Link>
          }
          slides={CLIENT_PERSPECTIVES.map((review) => ({
            key: review.author,
            node: <ReviewCard review={review} />,
          }))}
        >
          <h2 id="ll-reviews-title" className="ll-serif-title ll-section-title">
            Why Clients Trust Leap Living
          </h2>
        </Carousel>
      </div>
    </section>
  )
}
