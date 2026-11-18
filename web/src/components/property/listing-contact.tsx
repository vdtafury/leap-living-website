'use client'

import { listingContactLinks } from '@/lib/contact-links'
import { useSiteContact } from '@/components/layout/site-contact'
import { MailIcon, PhoneIcon, WhatsAppIcon } from '@/components/ui/icons'

/**
 * WhatsApp / Call / Email for one listing (D-46). The WhatsApp message and the email subject
 * name the listing, its reference and its link, so the team knows at once what it is about.
 * A button whose setting is empty or invalid is not shown.
 */
export function ListingContact({
  title,
  refCode,
  path,
}: {
  title: string
  refCode: string
  path: string
}) {
  const contact = useSiteContact()
  if (!contact) return null
  const links = listingContactLinks(contact, { title, refCode, path })
  if (!links.whatsapp && !links.call && !links.email) return null

  return (
    <div className="ll-pc-contact" role="group" aria-label={`Contact us about ${title}`}>
      {links.whatsapp && (
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="ll-pc-contact-btn ll-pc-contact-btn--wa"
        >
          <WhatsAppIcon size={16} />
          <span>WhatsApp</span>
          <span className="sr-only"> about {title} (opens WhatsApp)</span>
        </a>
      )}
      {links.call && (
        <a href={links.call} className="ll-pc-contact-btn">
          <PhoneIcon size={15} />
          <span>Call</span>
          <span className="sr-only">
            {' '}
            {contact.phoneDisplay} about {title}
          </span>
        </a>
      )}
      {links.email && (
        <a href={links.email} className="ll-pc-contact-btn">
          <MailIcon size={16} />
          <span>Email</span>
          <span className="sr-only"> about {title}</span>
        </a>
      )}
    </div>
  )
}
