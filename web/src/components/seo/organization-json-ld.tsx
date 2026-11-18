import type { SiteSettings } from '@/data/content-defaults'
import { SITE_URL } from '@/lib/seo'

/** schema.org RealEstateAgent: lets search engines show the company's contact card. */
export function OrganizationJsonLd({ settings }: { settings: SiteSettings }) {
  const { company, social } = settings
  const data = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: company.legalName,
    alternateName: company.name,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/leap-living-logo-teal.png`,
    image: `${SITE_URL}/brand/og-image.jpg`,
    description: company.description,
    telephone: company.phoneDisplay,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.addressStreet,
      addressLocality: company.addressLocality,
      addressCountry: 'AE',
    },
    areaServed: 'Dubai, United Arab Emirates',
    sameAs: Object.values(social).filter(Boolean),
  }
  return (
    <script
      type="application/ld+json"
      // JSON-LD is data, not script; "<" is escaped so the content can never close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
