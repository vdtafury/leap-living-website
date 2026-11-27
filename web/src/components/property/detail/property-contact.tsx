'use client'

import { useEffect, useState } from 'react'
import { listingContactLinks, type ListingContactLinks } from '@/lib/contact-links'
import { useSiteContact } from '@/components/layout/site-contact'
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CalculatorIcon,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
} from '@/components/ui/icons'

export interface DealListing {
  title: string
  refCode: string
  path: string
  transactionType: 'BUY' | 'RENT'
  statusLabel: string
  priceLabel: string
  priceFrequency?: string
}

function useListingLinks(listing: DealListing): ListingContactLinks | null {
  const contact = useSiteContact()
  if (!contact) return null
  return listingContactLinks(contact, listing)
}

/**
 * The price and every way to reach us, beside the photos on desktop (sticky while reading)
 * and right under them on phones. "Book a private viewing" goes to the form further down;
 * WhatsApp / Call / Email carry the listing's name, reference and link (D-46).
 */
export function PropertyDealCard({
  listing,
  monthlyEstimate,
}: {
  listing: DealListing
  /** BUY only: the calculator's own default estimate, already formatted ("AED 56,124"). */
  monthlyEstimate?: string | null
}) {
  const links = useListingLinks(listing)
  const contact = useSiteContact()
  const isBuy = listing.transactionType === 'BUY'

  return (
    <div className="ll-pd-deal" id="pd-deal">
      <div className="ll-pd-deal-price">
        <span className="ll-pd-deal-label">{isBuy ? 'Guide asking price' : 'Annual lease'}</span>
        <strong className="tabular-nums">
          {listing.priceLabel}
          {listing.priceFrequency && <small> {listing.priceFrequency}</small>}
        </strong>
        {isBuy && monthlyEstimate && (
          <a href="#financing" className="ll-pd-deal-est">
            <CalculatorIcon size={16} />
            <span>
              Est. <b className="tabular-nums">{monthlyEstimate}</b>/month with a mortgage
            </span>
            <ArrowRightIcon size={14} />
          </a>
        )}
      </div>

      <div className="ll-pd-deal-actions">
        <a href="#viewing" className="ll-btn ll-btn-primary ll-btn-full">
          <span>Book a private viewing</span>
          <ArrowUpRightIcon size={15} />
        </a>

        {links && (links.whatsapp || links.call || links.email) && (
          <div
            className="ll-pd-deal-links"
            role="group"
            aria-label={`Contact us about ${listing.title}`}
          >
            {links.whatsapp && (
              <a
                href={links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="ll-pd-link ll-pd-link--wa"
              >
                <WhatsAppIcon size={17} />
                <span>WhatsApp</span>
                <span className="sr-only"> about {listing.title} (opens WhatsApp)</span>
              </a>
            )}
            {links.call && (
              <a href={links.call} className="ll-pd-link">
                <PhoneIcon size={16} />
                <span>Call</span>
                <span className="sr-only">
                  {' '}
                  {contact?.phoneDisplay} about {listing.title}
                </span>
              </a>
            )}
            {links.email && (
              <a href={links.email} className="ll-pd-link">
                <MailIcon size={17} />
                <span>Email</span>
                <span className="sr-only"> about {listing.title}</span>
              </a>
            )}
          </div>
        )}
      </div>

      <dl className="ll-pd-deal-meta">
        <div>
          <dt>Reference</dt>
          <dd className="tabular-nums">{listing.refCode}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{listing.statusLabel}</dd>
        </div>
      </dl>
    </div>
  )
}

/**
 * Phones and tablets: once the price card has scrolled away, a slim bar keeps the price,
 * WhatsApp, Call and the viewing link at the bottom of the screen. It steps aside while the
 * price card, the viewing form or the footer is on screen.
 */
export function PropertyContactDock({ listing }: { listing: DealListing }) {
  const links = useListingLinks(listing)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const targets = ['#pd-deal', '#viewing', 'footer']
      .map((selector) => document.querySelector(selector))
      .filter((el): el is Element => Boolean(el))
    if (targets.length === 0 || typeof IntersectionObserver === 'undefined') return

    const visible = new Set<Element>()
    let passedCard = false
    const card = document.querySelector('#pd-deal')
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
        if (entry.target === card && !entry.isIntersecting) {
          passedCard = entry.boundingClientRect.top < 0
        }
      }
      setShow(passedCard && visible.size === 0)
    })
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className={`ll-pd-dock${show ? ' is-shown' : ''}`} aria-hidden={!show} inert={!show}>
      <div className="ll-pd-dock-price">
        <strong className="tabular-nums">{listing.priceLabel}</strong>
        <span>
          {listing.priceFrequency
            ? listing.priceFrequency.replace(/^\/\s*/, 'per ')
            : listing.refCode}
        </span>
      </div>
      {links?.whatsapp && (
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="ll-pd-dock-icon ll-pd-dock-icon--wa"
        >
          <WhatsAppIcon size={19} />
          <span className="sr-only">WhatsApp us about {listing.title}</span>
        </a>
      )}
      {links?.call && (
        <a href={links.call} className="ll-pd-dock-icon">
          <PhoneIcon size={18} />
          <span className="sr-only">Call us about {listing.title}</span>
        </a>
      )}
      <a href="#viewing" className="ll-pd-dock-cta">
        Viewing
        <ArrowUpRightIcon size={14} />
      </a>
    </div>
  )
}

/** Beside the viewing form: the team's direct phone and email, for those who would rather talk. */
export function ViewingDirectLines() {
  const contact = useSiteContact()
  if (!contact) return null
  const phone = contact.phoneHref.trim() ? contact.phoneHref : null
  const email = contact.email.trim() || null
  if (!phone && !email) return null

  return (
    <div className="ll-pd-direct">
      <span className="ll-pd-direct-label">Prefer to talk now?</span>
      {phone && (
        <a href={phone}>
          <PhoneIcon size={16} />
          <span className="tabular-nums">{contact.phoneDisplay}</span>
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`}>
          <MailIcon size={16} />
          <span>{email}</span>
        </a>
      )}
    </div>
  )
}
