import {
  DEFAULT_ABOUT,
  DEFAULT_HOME,
  DEFAULT_SETTINGS,
  type AboutContent,
  type HomeContent,
  type SiteSettings,
} from '@/data/content-defaults'
import { documentSchema, type Fields, type SectionDef } from './fields'

const link = (label: string): Fields => ({
  label: { kind: 'text', label: `${label} label`, max: 40 },
  href: { kind: 'href', label: `${label} link` },
})

const navLink: Fields = {
  label: { kind: 'text', label: 'Label', max: 40 },
  href: { kind: 'href', label: 'Link' },
}

export const HOME_SECTIONS: Record<keyof HomeContent, SectionDef> = {
  hero: {
    label: 'Hero',
    help: 'The video, search bar and layout stay as designed; only the words change.',
    fields: {
      titleLine1: { kind: 'text', label: 'Title, first line', max: 40 },
      titleLine2: { kind: 'text', label: 'Title, second line (teal)', max: 40 },
      primaryCta: { kind: 'group', label: 'Main button', fields: link('Button') },
      secondaryCta: { kind: 'group', label: 'Second button', fields: link('Button') },
    },
  },
  stats: {
    label: 'Key figures band',
    help: 'Icons follow the order: calendar, stack, shield, people.',
    fields: {
      items: {
        kind: 'list',
        label: 'Figures',
        itemLabel: 'Figure',
        min: 1,
        max: 4,
        item: {
          value: { kind: 'text', label: 'Figure', max: 24 },
          description: { kind: 'textarea', label: 'Text', max: 160 },
        },
      },
    },
  },
  featured: {
    label: 'Featured properties',
    help: 'The cards come from listings marked “Featured” (Buy, published).',
    fields: {
      title: { kind: 'text', label: 'Heading', max: 80 },
      linkLabel: { kind: 'text', label: 'Link label', max: 40 },
    },
  },
  services: {
    label: 'Services',
    fields: {
      eyebrow: { kind: 'text', label: 'Small label above the heading', max: 40 },
      title: { kind: 'text', label: 'Heading', max: 80 },
      intro: { kind: 'textarea', label: 'Short text under the heading', max: 240 },
      linkLabel: { kind: 'text', label: 'Link label', max: 40 },
      linkHref: { kind: 'href', label: 'Link' },
      items: {
        kind: 'list',
        label: 'Service cards',
        itemLabel: 'Service',
        min: 1,
        max: 6,
        help: 'Four cards fit one row on a computer; keep descriptions to one short sentence.',
        item: {
          icon: {
            kind: 'select',
            label: 'Icon',
            default: 'auto',
            options: [
              { value: 'auto', label: 'Automatic (from the title)' },
              { value: 'home', label: 'House (buying)' },
              { value: 'chart', label: 'Rising chart (investment)' },
              { value: 'handshake', label: 'Handshake (sales)' },
              { value: 'layers', label: 'Layers (portfolio)' },
              { value: 'compass', label: 'Compass (consultancy)' },
              { value: 'key', label: 'Key (renting)' },
              { value: 'shield', label: 'Shield (management)' },
            ],
          },
          title: { kind: 'text', label: 'Title', max: 60 },
          desc: { kind: 'textarea', label: 'Description', max: 220 },
          featured: { kind: 'boolean', label: 'Show the tag above the title' },
          tag: { kind: 'text', label: 'Tag (e.g. Core practice)', max: 24, optional: true },
        },
      },
    },
  },
  projects: {
    label: 'Projects',
    help: 'The cards come from projects marked “Featured” (published).',
    fields: {
      title: { kind: 'text', label: 'Heading', max: 80 },
      linkLabel: { kind: 'text', label: 'Link label', max: 40 },
    },
  },
  advice: {
    label: 'Valuation & mortgage card',
    fields: {
      eyebrow: { kind: 'text', label: 'Small label', max: 40 },
      title: { kind: 'text', label: 'Heading', max: 80 },
      ownersLabel: { kind: 'text', label: 'Owners label', max: 30 },
      ownersTitle: { kind: 'text', label: 'Owners question', max: 80 },
      ownersText: { kind: 'textarea', label: 'Owners text', max: 220 },
      ctaLabel: { kind: 'text', label: 'Button label', max: 40 },
      ctaHref: { kind: 'href', label: 'Button link' },
    },
  },
  calculator: {
    label: 'Mortgage calculator defaults',
    help: 'Starting values only; visitors change them freely.',
    fields: {
      price: {
        kind: 'number',
        label: 'Property price (AED)',
        min: 100000,
        max: 1000000000,
        step: 1000,
      },
      downPaymentPercent: { kind: 'number', label: 'Down payment (%)', min: 0, max: 90, step: 1 },
      interestRate: { kind: 'number', label: 'Interest rate (%)', min: 0, max: 20, step: 0.01 },
      years: { kind: 'number', label: 'Loan term (years)', min: 1, max: 30, step: 1 },
    },
  },
  reviews: {
    label: 'Client reviews',
    help: 'Generic man / woman icons only: no photos of people on the homepage.',
    fields: {
      title: { kind: 'text', label: 'Heading', max: 80 },
      linkLabel: { kind: 'text', label: 'Link label', max: 40 },
      linkHref: { kind: 'href', label: 'Link' },
      items: {
        kind: 'list',
        label: 'Reviews',
        itemLabel: 'Review',
        min: 1,
        max: 12,
        item: {
          author: { kind: 'text', label: 'Name', max: 40 },
          role: { kind: 'text', label: 'Role', max: 60 },
          avatar: {
            kind: 'select',
            label: 'Icon',
            options: [
              { value: 'man', label: 'Man' },
              { value: 'woman', label: 'Woman' },
            ],
          },
          title: { kind: 'text', label: 'Headline', max: 80 },
          quote: { kind: 'textarea', label: 'Review', max: 400 },
        },
      },
    },
  },
}

export const ABOUT_SECTIONS: Record<keyof AboutContent, SectionDef> = {
  seo: {
    label: 'Search engines',
    fields: {
      title: { kind: 'text', label: 'Page title', max: 70 },
      description: { kind: 'textarea', label: 'Description', max: 170 },
    },
  },
  hero: {
    label: 'Top of page',
    fields: {
      eyebrow: { kind: 'text', label: 'Small label', max: 40 },
      title: { kind: 'text', label: 'Heading', max: 80 },
      description: { kind: 'textarea', label: 'Text', max: 500 },
      imageAlt: { kind: 'text', label: 'Image description (for screen readers)', max: 120 },
    },
  },
  pillars: {
    label: 'Philosophy, mission, vision',
    fields: {
      items: {
        kind: 'list',
        label: 'Cards',
        itemLabel: 'Card',
        min: 1,
        max: 3,
        item: {
          label: { kind: 'text', label: 'Label', max: 24 },
          title: { kind: 'text', label: 'Heading', max: 60 },
          text: { kind: 'textarea', label: 'Text', max: 400 },
        },
      },
    },
  },
  leadership: {
    label: 'Leadership',
    fields: {
      name: { kind: 'text', label: 'Name', max: 60 },
      role: { kind: 'text', label: 'Title', max: 60 },
      shortRole: { kind: 'text', label: 'Short title', max: 20 },
      badge: { kind: 'text', label: 'Badge line', max: 80 },
      paragraphs: {
        kind: 'list',
        label: 'Biography',
        itemLabel: 'Paragraph',
        min: 1,
        max: 4,
        item: { kind: 'textarea', label: 'Paragraph', max: 600 },
      },
      ctaLabel: { kind: 'text', label: 'Button label', max: 50 },
      ctaHref: { kind: 'href', label: 'Button link' },
    },
  },
  services: {
    label: 'Services',
    fields: {
      eyebrow: { kind: 'text', label: 'Small label', max: 40 },
      title: { kind: 'text', label: 'Heading', max: 80 },
      lead: { kind: 'textarea', label: 'Intro', max: 300 },
      items: {
        kind: 'list',
        label: 'Services',
        itemLabel: 'Service',
        min: 1,
        max: 12,
        item: {
          title: { kind: 'text', label: 'Title', max: 80 },
          desc: { kind: 'textarea', label: 'Description', max: 240 },
        },
      },
    },
  },
}

export const SETTINGS_SECTIONS: Record<keyof SiteSettings, SectionDef> = {
  company: {
    label: 'Company & contact',
    fields: {
      name: { kind: 'text', label: 'Brand name', max: 40 },
      legalName: { kind: 'text', label: 'Legal name', max: 80 },
      description: { kind: 'textarea', label: 'Short description (structured data)', max: 300 },
      tagline: { kind: 'text', label: 'Footer tagline', max: 60 },
      phoneDisplay: { kind: 'text', label: 'Phone (as shown)', max: 30 },
      phoneHref: { kind: 'href', label: 'Phone link', help: 'tel:+971…' },
      whatsapp: { kind: 'url', label: 'WhatsApp link' },
      email: { kind: 'email', label: 'Email' },
      addressLines: {
        kind: 'list',
        label: 'Address lines',
        itemLabel: 'Line',
        min: 1,
        max: 3,
        item: { kind: 'text', label: 'Line', max: 80 },
      },
      addressStreet: { kind: 'text', label: 'Street (structured data)', max: 120 },
      addressLocality: { kind: 'text', label: 'Locality (structured data)', max: 80 },
      region: { kind: 'text', label: 'City and country line', max: 60 },
    },
  },
  social: {
    label: 'Social links',
    help: 'Leave a link empty to hide its icon.',
    fields: {
      instagram: { kind: 'url', label: 'Instagram', optional: true },
      linkedin: { kind: 'url', label: 'LinkedIn', optional: true },
      facebook: { kind: 'url', label: 'Facebook', optional: true },
      tiktok: { kind: 'url', label: 'TikTok', optional: true },
    },
  },
  navigation: {
    label: 'Main menu',
    help: 'The Mortgage Calculator and Free Valuation buttons stay as designed.',
    fields: {
      links: { kind: 'list', label: 'Links', itemLabel: 'Link', min: 1, max: 8, item: navLink },
    },
  },
  footer: {
    label: 'Footer',
    fields: {
      columns: {
        kind: 'list',
        label: 'Link columns',
        itemLabel: 'Column',
        min: 1,
        max: 4,
        item: {
          title: { kind: 'text', label: 'Heading', max: 30 },
          links: { kind: 'list', label: 'Links', itemLabel: 'Link', min: 1, max: 8, item: navLink },
        },
      },
      locationTitle: { kind: 'text', label: 'Location heading', max: 30 },
      copyright: { kind: 'text', label: 'Copyright line', max: 120 },
      note: { kind: 'text', label: 'Bottom note', max: 120 },
    },
  },
  seo: {
    label: 'Search engines',
    fields: {
      homeTitle: { kind: 'text', label: 'Homepage title', max: 70 },
      description: { kind: 'textarea', label: 'Default description', max: 300 },
    },
  },
}

export const DOCUMENTS = {
  home: { title: 'Homepage', path: '/', sections: HOME_SECTIONS, defaults: DEFAULT_HOME },
  about: { title: 'About page', path: '/about', sections: ABOUT_SECTIONS, defaults: DEFAULT_ABOUT },
  settings: {
    title: 'Site settings',
    path: null,
    sections: SETTINGS_SECTIONS,
    defaults: DEFAULT_SETTINGS,
  },
} as const

export type DocumentKey = keyof typeof DOCUMENTS
export interface DocumentTypes {
  home: HomeContent
  about: AboutContent
  settings: SiteSettings
}

export const DOCUMENT_KEYS = Object.keys(DOCUMENTS) as DocumentKey[]
export const isDocumentKey = (key: string): key is DocumentKey => key in DOCUMENTS

const SCHEMAS = {
  home: documentSchema(HOME_SECTIONS),
  about: documentSchema(ABOUT_SECTIONS),
  settings: documentSchema(SETTINGS_SECTIONS),
}

export function parseDocument<K extends DocumentKey>(
  key: K,
  value: unknown,
): { ok: true; data: DocumentTypes[K] } | { ok: false; error: string } {
  const parsed = SCHEMAS[key].safeParse(value)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { ok: false, error: issue.message }
  }
  return { ok: true, data: parsed.data as unknown as DocumentTypes[K] }
}
