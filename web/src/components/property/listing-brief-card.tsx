'use client'

import Link from 'next/link'
import { useSiteContact } from '@/components/layout/site-contact'
import { briefWhatsappLink } from '@/lib/contact-links'
import { ArrowRightIcon, KeyIcon, WhatsAppIcon } from '@/components/ui/icons'

/**
 * The last tile of the Buy / Rent grid: a teal card asking the visitor for their brief.
 * It always fills the empty end of the last row: `--fill3` / `--fill2` are the number of free
 * slots in a 3- and a 2-column grid (0 = the row is full, so it becomes a full-width band).
 */
export function ListingBriefCard({ mode, count }: { mode: 'BUY' | 'RENT'; count: number }) {
  const contact = useSiteContact()
  const whatsapp = contact ? briefWhatsappLink(contact, mode) : null
  const free3 = (3 - (count % 3)) % 3
  const free2 = count % 2

  return (
    <aside
      className="ll-brief"
      data-free3={free3}
      data-free2={free2}
      aria-labelledby="ll-brief-title"
    >
      <div className="ll-brief-inner">
        <span className="ll-brief-icon" aria-hidden="true">
          <KeyIcon size={22} />
        </span>
        <div className="ll-brief-copy">
          <h3 id="ll-brief-title" className="ll-brief-title">
            {mode === 'BUY' ? 'Can’t find the right home?' : 'Can’t find the right rental?'}
          </h3>
          <p className="ll-brief-text">
            Tell us what you are looking for and an advisor will shortlist options for you,
            including off-market homes.
          </p>
        </div>
        <div className="ll-brief-actions">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="ll-btn ll-brief-btn ll-brief-btn--solid"
            >
              <WhatsAppIcon size={16} />
              <span>WhatsApp us</span>
              <span className="sr-only"> (opens WhatsApp)</span>
            </a>
          )}
          <Link href="/contact" className="ll-btn ll-brief-btn">
            <span>Send your brief</span>
            <ArrowRightIcon size={15} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
