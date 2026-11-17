/**
 * Company facts shown on the site (footer, contact page, structured data).
 * Source: the client's current website, https://leapliving.ae (owner: "all the data there is
 * correct", 2026-11-17). Change them here only.
 */
export const SITE = {
  name: 'LEAP LIVING',
  legalName: 'Leap Living Real Estate Consultancy',
  description:
    'Certainty through precision. Leap Living brings institutional clarity, strategic foresight, and over two decades of Dubai real estate leadership to high-value property decisions.',
  phone: { href: 'tel:+971521459888', display: '+971 52 145 9888' },
  whatsapp: 'https://wa.me/971521459888',
  email: 'contact@leapliving.ae',
  address: {
    lines: ['9th Floor, Media One Tower, Media One Hotel', 'Al Falak St., Dubai Media City'],
    street: '9th Floor, Media One Tower, Media One Hotel, Al Falak St.',
    locality: 'Dubai Media City, Dubai',
    country: 'AE',
    countryName: 'United Arab Emirates',
  },
  socials: {
    facebook: 'https://www.facebook.com/people/Leap-Living/61563188675570/',
    instagram: 'https://www.instagram.com/leapliving.ae/',
    linkedin: 'https://www.linkedin.com/company/leap-living-ae',
    tiktok: 'https://www.tiktok.com/@leap.living',
  },
} as const
