import Link from 'next/link'
import { CLIENT_PERSPECTIVES } from '@/data/catalog'
import { Carousel } from '@/components/ui/carousel'
import { ArrowUpRightIcon, AvatarIcon } from '@/components/ui/icons'

type Review = (typeof CLIENT_PERSPECTIVES)[number]

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="ll-review">
      <figcaption className="ll-review-author">
        <span className="ll-review-avatar">
          <AvatarIcon variant={review.avatar} />
        </span>
        <span className="ll-review-person">
          <span className="ll-review-name">{review.author}</span>
          <span className="ll-review-role">{review.role}</span>
        </span>
      </figcaption>
      <h3 className="ll-review-title">{review.title}</h3>
      <blockquote className="ll-review-quote">
        <p>{review.quote}</p>
      </blockquote>
    </figure>
  )
}

/**
 * Homepage client reviews, after providentestate.com "Why Our Clients Trust Us": a row of cards
 * with a generic man / woman avatar, name, role, review headline and text (owner, 2026-11-17).
 * Cards are server-rendered; only the shared carousel (arrows, counter, progress, swipe) runs in
 * the browser.
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
