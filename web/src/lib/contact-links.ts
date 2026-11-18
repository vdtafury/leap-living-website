/**
 * WhatsApp / call / email links for one listing (property cards, D-46). Pure, so the cards
 * and the tests share it. The numbers and address come from Admin → Site settings.
 */

export interface SiteContact {
  /** `tel:` link, e.g. tel:+971521459888 */
  phoneHref: string
  phoneDisplay: string
  /** WhatsApp click-to-chat link, e.g. https://wa.me/971521459888 */
  whatsapp: string
  email: string
  /** Public origin, so the message carries a link to the listing */
  siteUrl: string
}

export interface ListingRef {
  title: string
  refCode: string
  /** Site path of the listing, e.g. /properties/the-waterfront-sky-villa */
  path: string
}

export interface ListingContactLinks {
  whatsapp: string | null
  call: string | null
  email: string | null
}

const listingUrl = (contact: SiteContact, listing: ListingRef) =>
  `${contact.siteUrl.replace(/\/+$/, '')}${listing.path}`

const label = (listing: ListingRef) =>
  listing.refCode ? `${listing.title} (Ref ${listing.refCode})` : listing.title

/** Only https links (wa.me / api.whatsapp.com); anything else in the settings is ignored. */
function whatsappLink(base: string, text: string): string | null {
  let url: URL
  try {
    url = new URL(base.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null
  url.searchParams.delete('text')
  // %20, not "+", for spaces: WhatsApp does not always read "+" as a space
  const query = url.searchParams.toString()
  url.search = `${query ? `${query}&` : ''}text=${encodeURIComponent(text)}`
  return url.toString()
}

function telLink(href: string): string | null {
  const digits = href
    .trim()
    .replace(/^tel:/i, '')
    .replace(/[^\d+]/g, '')
  return /^\+?\d{6,15}$/.test(digits) ? `tel:${digits}` : null
}

function mailLink(address: string, subject: string, body: string): string | null {
  const email = address.trim()
  if (!/^[^\s@<>?&]+@[^\s@<>?&]+\.[^\s@<>?&]+$/.test(email)) return null
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function listingContactLinks(
  contact: SiteContact,
  listing: ListingRef,
): ListingContactLinks {
  const url = listingUrl(contact, listing)
  return {
    whatsapp: whatsappLink(
      contact.whatsapp,
      `Hello Leap Living, I am interested in ${label(listing)}: ${url}`,
    ),
    call: telLink(contact.phoneHref),
    email: mailLink(
      contact.email,
      `Enquiry: ${label(listing)}`,
      `Hello Leap Living,\n\nI am interested in ${label(listing)}.\n${url}\n\nPlease contact me with more details.\n`,
    ),
  }
}
