import { CLIENT_PERSPECTIVES, FULL_SERVICE_CATALOG, HOME_SERVICES } from './catalog'
import { SITE } from './site'

/**
 * The site text as it was before the CMS (Phase 2). Used to seed the content documents on the
 * first start, and as the fallback when a document has never been published. Pure data: safe
 * to import from client components (error page) as well as from the server.
 * The shapes are validated by the section registry in src/modules/content.
 */

export const DEFAULT_SETTINGS = {
  company: {
    name: SITE.name,
    legalName: SITE.legalName,
    description: SITE.description,
    tagline: 'Certainty through precision.',
    phoneDisplay: SITE.phone.display,
    phoneHref: SITE.phone.href,
    whatsapp: SITE.whatsapp,
    email: SITE.email,
    addressLines: [...SITE.address.lines],
    addressStreet: SITE.address.street,
    addressLocality: SITE.address.locality,
    region: 'Dubai, United Arab Emirates',
  },
  social: {
    instagram: SITE.socials.instagram,
    linkedin: SITE.socials.linkedin,
    facebook: SITE.socials.facebook,
    tiktok: SITE.socials.tiktok,
  },
  navigation: {
    links: [
      // Visitor tasks first (most to least common), then the company, Contact last beside the
      // header buttons (owner, 2026-11-18).
      { label: 'Home', href: '/' },
      { label: 'Buy', href: '/buy' },
      { label: 'Rent', href: '/rent' },
      { label: 'Sell', href: '/sell' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  footer: {
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Real Estate Consultancy', href: '/about#services' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      {
        title: 'Properties',
        links: [
          { label: 'Buy', href: '/buy' },
          { label: 'Rent', href: '/rent' },
          { label: 'Sell', href: '/sell' },
          { label: 'Featured Projects', href: '/projects' },
        ],
      },
      {
        title: 'Information',
        links: [
          { label: 'Company Profile', href: '/about' },
          { label: 'Executive Leadership', href: '/about#leadership' },
          { label: 'Free Property Valuation', href: '/sell#valuation-form' },
          { label: 'Mortgage Calculator', href: '/#mortgage-calculator' },
          { label: 'Privacy Policy', href: '/contact?topic=privacy' },
          { label: 'Terms of Use', href: '/contact?topic=terms' },
        ],
      },
    ],
    locationTitle: 'Location',
    copyright: '© 2026 Leap Living Real Estate Consultancy. All Rights Reserved.',
    note: 'Dubai, United Arab Emirates · leapliving.ae',
  },
  seo: {
    homeTitle: 'LEAP LIVING | Real Estate Consultancy — Dubai, UAE',
    description: SITE.description,
  },
}

export const DEFAULT_HOME = {
  hero: {
    titleLine1: 'Unlock your',
    titleLine2: 'next move.',
    primaryCta: { label: 'Explore Properties', href: '/buy' },
    secondaryCta: { label: 'Our Approach', href: '/about' },
  },
  featured: {
    title: 'Featured Properties for Sale',
    linkLabel: 'View All Properties for Sale',
  },
  services: {
    eyebrow: 'Our Services',
    title: 'End-to-End Real Estate Advisory',
    intro:
      "A comprehensive, client-first approach to buying, selling, renting, and investing in Dubai's prime real estate.",
    linkLabel: 'Explore Full Service Scope',
    linkHref: '/about#services',
    items: HOME_SERVICES.map((s) => ({
      icon: s.icon as string,
      title: s.title,
      desc: s.desc,
      tag: '',
      featured: false,
    })),
  },
  projects: {
    title: 'Selected Real Estate Projects',
    linkLabel: 'Browse All Projects',
  },
  advice: {
    eyebrow: 'Owner & Buyer Advisory',
    title: 'Free Property Valuation & Mortgage Planning',
    ownersLabel: 'For Owners',
    ownersTitle: 'What is your property worth?',
    ownersText: 'A free, no-obligation valuation based on recent transactions in your community.',
    ctaLabel: 'Request Free Valuation',
    ctaHref: '/sell#valuation-form',
  },
  calculator: {
    price: 2500000,
    downPaymentPercent: 20,
    interestRate: 4.25,
    years: 25,
  },
  reviews: {
    title: 'Why Clients Trust Leap Living',
    linkLabel: 'Speak With an Advisor',
    linkHref: '/contact',
    items: CLIENT_PERSPECTIVES.map((r) => ({ ...r })),
  },
}

export const DEFAULT_ABOUT = {
  seo: {
    title: 'About Us & Real Estate Consultancy | LEAP LIVING Dubai',
    description:
      'Leap Living brings over two decades of Dubai real estate leadership, independent Real Estate Consultancy, and institutional advisory.',
  },
  hero: {
    eyebrow: 'Certainty Through Precision',
    title: 'Experience That Shapes Better Decisions',
    description:
      'Leap Living is a real estate consultancy built on a simple belief: better decisions come from clarity and precision. In a market driven by pace and ambition, we bring focus, strategic depth, and a deliberate approach to every opportunity.',
    imageAlt: 'Dubai commercial glass towers',
  },
  pillars: {
    items: [
      {
        label: 'Philosophy',
        title: 'Advisory Over Speculation',
        text: 'We believe real estate decisions should never be rushed, influenced by noise, or driven by uncertainty. As an independent consultancy, we operate as a trusted partner rather than a conventional transactional brokerage.',
      },
      {
        label: 'Mission',
        title: 'Informed Client Clarity',
        text: 'To strengthen decision-making for property buyers and investors through well-informed, experience-driven real estate advisory — grounded in strategic thinking, market clarity, and long-term value rather than short-term opportunity.',
      },
      {
        label: 'Vision',
        title: 'Disciplined Long-Term Value',
        text: 'To be a globally respected real estate consultancy, recognized for its disciplined approach, depth of experience, and consistent focus on long-term value creation across cycles.',
      },
    ],
  },
  leadership: {
    name: 'Mohab Samak',
    role: 'Chief Executive Officer',
    shortRole: 'CEO',
    badge: '21+ Years UAE Real Estate Leadership (Since 2005)',
    paragraphs: [
      'Since beginning his real estate career in Dubai in 2005, Mohab Samak has held senior leadership and executive roles across prominent industry firms including Emaar Properties, Hamptons International, Coldwell Banker, Engel & Völkers Dubai, D&B Properties, and Metropolitan Premium Properties.',
      'His career spans large-scale residential and commercial master developments, developer project commercialisation, private wealth mandates, and cross-cycle advisory strategy.',
    ],
    ctaLabel: 'Request an Executive Consultation',
    ctaHref: '/contact',
  },
  // D-57: filled from the admin once the team photos and bios arrive. While the list is
  // empty the section (and its #team anchor) is not rendered: no placeholder people.
  team: {
    title: 'Meet the Team',
    intro: '',
    members: [] as TeamMember[],
  },
  services: {
    eyebrow: 'Advisory Capabilities',
    title: 'Real Estate Consultancy & Core Services',
    lead: 'Full-spectrum client advisory engineered for private individuals, institutional investors, family offices, and master developers.',
    items: FULL_SERVICE_CATALOG.map((s) => ({ ...s })),
  },
}

/** One person in the About page's Meet the Team section (D-57). Empty strings = not shown. */
export interface TeamMember {
  name: string
  role: string
  photo: string
  bio: string
  brn: string
  email: string
  linkedin: string
}

export type SiteSettings = typeof DEFAULT_SETTINGS
export type HomeContent = typeof DEFAULT_HOME
export type AboutContent = typeof DEFAULT_ABOUT
