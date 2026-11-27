import { describe, expect, it } from 'vitest'
import { briefWhatsappLink, listingContactLinks, type SiteContact } from './contact-links'

const CONTACT: SiteContact = {
  phoneHref: 'tel:+971521459888',
  phoneDisplay: '+971 52 145 9888',
  whatsapp: 'https://wa.me/971521459888',
  email: 'contact@leapliving.ae',
  siteUrl: 'https://leapliving.ae/',
}
const LISTING = {
  title: 'The Waterfront Sky Villa',
  refCode: 'LL-BUY-148',
  path: '/properties/the-waterfront-sky-villa',
}

describe('listing contact links', () => {
  it('builds WhatsApp, call and email links that name the listing', () => {
    const links = listingContactLinks(CONTACT, LISTING)
    const wa = new URL(links.whatsapp!)
    expect(wa.origin + wa.pathname).toBe('https://wa.me/971521459888')
    expect(wa.searchParams.get('text')).toBe(
      'Hello Leap Living, I am interested in The Waterfront Sky Villa (Ref LL-BUY-148): https://leapliving.ae/properties/the-waterfront-sky-villa',
    )
    expect(links.whatsapp).toContain('text=Hello%20Leap%20Living%2C%20')
    expect(links.whatsapp).not.toContain('+')
    expect(links.call).toBe('tel:+971521459888')
    expect(links.email).toMatch(/^mailto:contact@leapliving\.ae\?subject=/)
    const mail = new URL(links.email!)
    expect(mail.searchParams.get('subject')).toBe(
      'Enquiry: The Waterfront Sky Villa (Ref LL-BUY-148)',
    )
    expect(mail.searchParams.get('body')).toContain(
      'https://leapliving.ae/properties/the-waterfront-sky-villa',
    )
  })

  it('escapes titles with special characters', () => {
    const links = listingContactLinks(CONTACT, { ...LISTING, title: 'Villa & Pool #2?' })
    expect(new URL(links.whatsapp!).searchParams.get('text')).toContain('Villa & Pool #2?')
    expect(new URL(links.email!).searchParams.get('subject')).toContain('Villa & Pool #2?')
  })

  it('keeps an existing query on the WhatsApp link and replaces an old text', () => {
    const links = listingContactLinks(
      { ...CONTACT, whatsapp: 'https://api.whatsapp.com/send?phone=971521459888&text=old' },
      LISTING,
    )
    const wa = new URL(links.whatsapp!)
    expect(wa.searchParams.get('phone')).toBe('971521459888')
    expect(wa.searchParams.get('text')).toContain('The Waterfront Sky Villa')
  })

  it('hides a button when its setting is empty or unsafe', () => {
    const links = listingContactLinks(
      { ...CONTACT, whatsapp: 'javascript:alert(1)', phoneHref: '', email: 'not-an-email' },
      LISTING,
    )
    expect(links).toEqual({ whatsapp: null, call: null, email: null })
    expect(listingContactLinks({ ...CONTACT, whatsapp: 'http://wa.me/1' }, LISTING).whatsapp).toBe(
      null,
    )
    expect(listingContactLinks({ ...CONTACT, email: 'a@b.co?bcc=x@y.z' }, LISTING).email).toBeNull()
  })

  it('accepts a phone link written with spaces', () => {
    expect(
      listingContactLinks({ ...CONTACT, phoneHref: 'tel:+971 52 145 9888' }, LISTING).call,
    ).toBe('tel:+971521459888')
  })
})

describe('search brief WhatsApp link', () => {
  it('says what the visitor is looking for, per mode', () => {
    const buy = new URL(briefWhatsappLink(CONTACT, 'BUY')!)
    expect(buy.searchParams.get('text')).toBe(
      'Hello Leap Living, I am looking for a property to buy in Dubai.',
    )
    const rent = new URL(briefWhatsappLink(CONTACT, 'RENT')!)
    expect(rent.searchParams.get('text')).toContain('a property to rent')
  })

  it('returns null when the WhatsApp setting is not an https link', () => {
    expect(briefWhatsappLink({ ...CONTACT, whatsapp: 'javascript:alert(1)' }, 'BUY')).toBeNull()
  })
})
