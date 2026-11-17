import { SITE } from '@/data/site'
import { SITE_URL } from '@/lib/seo'

/** schema.org RealEstateAgent: lets search engines show the company's contact card. */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/leap-living-logo-teal.png`,
    image: `${SITE_URL}/brand/og-image.jpg`,
    description: SITE.description,
    telephone: SITE.phone.display,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressCountry: SITE.address.country,
    },
    areaServed: 'Dubai, United Arab Emirates',
    sameAs: Object.values(SITE.socials),
  }
  return (
    <script
      type="application/ld+json"
      // JSON-LD is data, not script; "<" is escaped so the content can never close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
