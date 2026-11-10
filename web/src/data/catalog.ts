/**
 * Curated advisory catalog data for Leap Living.
 * Note: Property and project entries represent SAMPLE / illustrative showcase mandates
 * for Phase 0 presentation until connected to live Phase 1/2 Prisma CMS tables.
 * Company profile copy, CEO credentials, services, and contact info strictly follow
 * approved CLIENT-SUPPLIED documentation in docs/business/client-content.md.
 */

export interface PropertyListing {
  slug: string
  refCode: string
  transactionType: 'BUY' | 'RENT'
  segment: 'RESIDENTIAL' | 'COMMERCIAL'
  statusLabel: string
  featured: boolean
  title: string
  subtitle: string
  community: string
  emirate: string
  propertyType: 'Villa' | 'Penthouse' | 'Apartment' | 'Duplex' | 'Commercial'
  priceAed: number
  priceLabel: string
  priceFrequency?: string
  beds: number
  baths: number
  areaSqFt: number
  areaFormatted: string
  completionStatus: 'Ready' | 'Off-Plan' | 'Leasing Available'
  heroImage: string
  gallery: string[]
  description: string
  highlights: string[]
  developer: string
}

export interface ProjectItem {
  slug: string
  refCode: string
  title: string
  developer: string
  community: string
  segment: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED-USE'
  status: 'Off-Plan' | 'Under Construction' | 'Handover 2026' | 'Ready'
  startingPriceAed: number
  startingPriceLabel: string
  handoverLabel: string
  paymentPlan: string
  unitTypes: string
  heroImage: string
  gallery: string[]
  overview: string
  keyFacts: { label: string; value: string }[]
  amenities: string[]
}

export const PROPERTIES: PropertyListing[] = [
  {
    slug: 'palm-jumeirah-waterfront-sky-villa',
    refCode: 'LL-BUY-148',
    transactionType: 'BUY',
    segment: 'RESIDENTIAL',
    statusLabel: 'Private Advisory',
    featured: true,
    title: 'The Waterfront Sky Villa',
    subtitle: 'Full-floor architectural waterfront residence with private plunge terrace',
    community: 'Palm Jumeirah',
    emirate: 'Dubai',
    propertyType: 'Villa',
    priceAed: 14800000,
    priceLabel: 'AED 14,800,000',
    beds: 5,
    baths: 6,
    areaSqFt: 6650,
    areaFormatted: '6,650 sq ft',
    completionStatus: 'Ready',
    heroImage: '/images/property-palm-villa.jpg',
    gallery: [
      '/images/property-palm-villa.jpg',
      '/images/waterfront-pool-estate.jpg',
      '/images/property-sky-penthouse.jpg',
    ],
    description:
      'Designed around uninterrupted sea horizons and natural indoor-outdoor flow, this private sky villa combines cantilevered architectural decks, bespoke natural timber soffits, and expansive glazing across a rare single-level residential footprint on Palm Jumeirah.',
    highlights: [
      'Private infinity-edge plunge pool & sunlit stone sundeck',
      'Double-aspect reception rooms with floor-to-ceiling low-iron glazing',
      'Dedicated private elevator lobby and enclosed resident garage allocation',
      'Turnkey handover readiness with direct beach club access',
    ],
    developer: 'Nakheel',
  },
  {
    slug: 'downtown-boulevard-sky-penthouse',
    refCode: 'LL-BUY-125',
    transactionType: 'BUY',
    segment: 'RESIDENTIAL',
    statusLabel: 'Ready-to-Move',
    featured: true,
    title: 'The Boulevard Sky Penthouse',
    subtitle: 'Elevated corner residence overlooking the Downtown Dubai skyline',
    community: 'Downtown Dubai',
    emirate: 'Dubai',
    propertyType: 'Penthouse',
    priceAed: 12500000,
    priceLabel: 'AED 12,500,000',
    beds: 4,
    baths: 5,
    areaSqFt: 5205,
    areaFormatted: '5,205 sq ft',
    completionStatus: 'Ready',
    heroImage: '/images/property-sky-penthouse.jpg',
    gallery: [
      '/images/property-sky-penthouse.jpg',
      '/images/hero-dubai-skyline.jpg',
      '/images/residence-cedar-dusk.jpg',
    ],
    description:
      'Positioned high above Mohammed Bin Rashid Boulevard, this corner penthouse balances warm European oak panelling, honed travertine joinery, and gallery-grade entertaining terraces facing the Burj Khalifa district.',
    highlights: [
      'Panoramic Burj Khalifa & Fountain district vantage point',
      'Separate wet and show kitchens equipped with integrated Swiss appliances',
      'Walk-in dressing suite with custom timber cabinetry and private study',
      '24-hour valet, private concierge, and resident sky lounge access',
    ],
    developer: 'Emaar',
  },
  {
    slug: 'dubai-hills-golfside-luxury-duplex',
    refCode: 'LL-BUY-096',
    transactionType: 'BUY',
    segment: 'RESIDENTIAL',
    statusLabel: 'Handover Q4 2029',
    featured: true,
    title: 'The Golfside Luxury Duplex',
    subtitle: 'Architectural twin-level pavilion fronting landscaped championship fairways',
    community: 'Dubai Hills Estate',
    emirate: 'Dubai',
    propertyType: 'Duplex',
    priceAed: 9600000,
    priceLabel: 'AED 9,600,000',
    beds: 4,
    baths: 5,
    areaSqFt: 6150,
    areaFormatted: '6,150 sq ft',
    completionStatus: 'Off-Plan',
    heroImage: '/images/property-golfside-duplex.jpg',
    gallery: [
      '/images/property-golfside-duplex.jpg',
      '/images/hero-villa-dusk.jpg',
      '/images/residence-boutique-facade.jpg',
    ],
    description:
      'Set along a quiet parkland greenbelt in Dubai Hills Estate, this contemporary duplex fuses blackened steel framing, warm vertical cedar cladding, and an enclosed landscaped courtyard tailored for long-term family living.',
    highlights: [
      'Direct fairway frontage and private landscaped garden sanctuary',
      'Covered outdoor dining pavilion opening onto double-height living area',
      '60/40 construction-linked payment schedule directly with master developer',
      'Minutes from Dubai Hills Golf Club and international school corridor',
    ],
    developer: 'Emaar',
  },
  {
    slug: 'emirates-hills-contemporary-signature-estate',
    refCode: 'LL-BUY-245',
    transactionType: 'BUY',
    segment: 'RESIDENTIAL',
    statusLabel: 'Exclusive Mandate',
    featured: false,
    title: 'Contemporary Golf-View Estate',
    subtitle: 'Bespoke architectural residence with resort-scale pool pavilion',
    community: 'Emirates Hills',
    emirate: 'Dubai',
    propertyType: 'Villa',
    priceAed: 24500000,
    priceLabel: 'AED 24,500,000',
    beds: 6,
    baths: 7,
    areaSqFt: 11200,
    areaFormatted: '11,200 sq ft',
    completionStatus: 'Ready',
    heroImage: '/images/hero-villa-dusk.jpg',
    gallery: [
      '/images/hero-villa-dusk.jpg',
      '/images/waterfront-pool-estate.jpg',
      '/images/property-palm-villa.jpg',
    ],
    description:
      'Conceived as a private multi-generational compound, this tiered residence pairs board-formed architectural concrete with deep shaded overhangs, wellness suites, and resort-grade entertaining terraces.',
    highlights: [
      'Private temperature-controlled lap pool and wellness pavilion',
      'Basement collector garage for 6 vehicles plus dedicated staff quarters',
      'Full home automation, acoustic glazing, and private office wing',
    ],
    developer: 'Private Development',
  },
  {
    slug: 'dubai-marina-waterfront-penthouse-lease',
    refCode: 'LL-RNT-065',
    transactionType: 'RENT',
    segment: 'RESIDENTIAL',
    statusLabel: 'Annual Lease',
    featured: false,
    title: 'Waterfront Marina Sky Residence',
    subtitle: 'Turnkey furnished executive duplex overlooking Dubai Marina yacht basin',
    community: 'Dubai Marina',
    emirate: 'Dubai',
    propertyType: 'Penthouse',
    priceAed: 650000,
    priceLabel: 'AED 650,000',
    priceFrequency: '/ year',
    beds: 3,
    baths: 4,
    areaSqFt: 3420,
    areaFormatted: '3,420 sq ft',
    completionStatus: 'Leasing Available',
    heroImage: '/images/residence-cedar-dusk.jpg',
    gallery: [
      '/images/residence-cedar-dusk.jpg',
      '/images/dubai-marina-commercial.jpg',
      '/images/property-sky-penthouse.jpg',
    ],
    description:
      'Available for immediate annual executive tenancy, this duplex offers uninterrupted yacht harbour perspectives, curated minimalist interiors, and direct boardwalk access within Emaar Beachfront & Marina corridor.',
    highlights: [
      'Fully furnished turnkey specification ready for corporate relocation',
      'Expansive wraparound terrace with open sea and marina views',
      'Two allocated underground parking bays and private beach access',
    ],
    developer: 'Emaar',
  },
  {
    slug: 'jumeirah-islands-waterfront-villa-lease',
    refCode: 'LL-RNT-110',
    transactionType: 'RENT',
    segment: 'RESIDENTIAL',
    statusLabel: 'Verified Leasing',
    featured: false,
    title: 'Lakefront Contemporary Courtyard Villa',
    subtitle: 'Renovated 4-bedroom waterfront family home in a private gated cluster',
    community: 'Jumeirah Islands',
    emirate: 'Dubai',
    propertyType: 'Villa',
    priceAed: 1100000,
    priceLabel: 'AED 1,100,000',
    priceFrequency: '/ year',
    beds: 4,
    baths: 5,
    areaSqFt: 5400,
    areaFormatted: '5,400 sq ft',
    completionStatus: 'Leasing Available',
    heroImage: '/images/waterfront-pool-estate.jpg',
    gallery: [
      '/images/waterfront-pool-estate.jpg',
      '/images/property-palm-villa.jpg',
      '/images/residence-boutique-facade.jpg',
    ],
    description:
      'Completely reimagined for quiet waterfront living, featuring a glass-walled poolside dining room, bespoke European kitchen finishes, and landscaped lakefront terrace.',
    highlights: [
      'Private temperature-regulated swimming pool and shaded pergola',
      'Flexible 1–2 cheque annual corporate or family lease terms',
      'Quiet cul-de-sac location with 24-hour community security',
    ],
    developer: 'Nakheel',
  },
  {
    slug: 'difc-executive-floorplate-office',
    refCode: 'LL-RNT-088',
    transactionType: 'RENT',
    segment: 'COMMERCIAL',
    statusLabel: 'Grade-A Commercial',
    featured: false,
    title: 'DIFC Gate District Advisory Suite',
    subtitle: 'Fitted institutional Grade-A family office & advisory floorplate',
    community: 'DIFC',
    emirate: 'Dubai',
    propertyType: 'Commercial',
    priceAed: 880000,
    priceLabel: 'AED 880,000',
    priceFrequency: '/ year',
    beds: 0,
    baths: 3,
    areaSqFt: 2850,
    areaFormatted: '2,850 sq ft',
    completionStatus: 'Leasing Available',
    heroImage: '/images/architecture-glass-towers.jpg',
    gallery: [
      '/images/architecture-glass-towers.jpg',
      '/images/hero-dubai-skyline.jpg',
    ],
    description:
      'A fully fitted Grade-A office floorplate in the heart of Dubai International Financial Centre, partitioned with acoustic glass boardrooms, private partner suites, and direct DIFC Gate connectivity.',
    highlights: [
      'DFSA/DIFC-compliant institutional corporate fit-out ready immediately',
      'Boardroom for 14 guests, 3 executive offices, and client reception lounge',
      'Includes 5 covered valet-serviced parking allocations',
    ],
    developer: 'DIFC Authority',
  },
]

export const PROJECTS: ProjectItem[] = [
  {
    slug: 'the-peninsula-harbour-residences',
    refCode: 'LL-PRJ-01',
    title: 'Harbour Crescent Residences',
    developer: 'Emaar',
    community: 'Dubai Marina & Beachfront',
    segment: 'RESIDENTIAL',
    status: 'Off-Plan',
    startingPriceAed: 4200000,
    startingPriceLabel: 'From AED 4,200,000',
    handoverLabel: 'Q4 2028',
    paymentPlan: '70 / 30 Construction-Linked',
    unitTypes: '1–4 Bedroom Waterfront Residences & Sky Suites',
    heroImage: '/images/dubai-marina-commercial.jpg',
    gallery: [
      '/images/dubai-marina-commercial.jpg',
      '/images/waterfront-pool-estate.jpg',
      '/images/hero-dubai-skyline.jpg',
    ],
    overview:
      'Occupying one of the final prime waterfront peninsulas bordering Dubai Marina and the Arabian Gulf, Harbour Crescent combines private beach frontage with yacht marina berths and panoramic sunset orientations.',
    keyFacts: [
      { label: 'Location', value: 'Dubai Marina / Beachfront' },
      { label: 'Unit Mix', value: '1–4 BR Apartments & Penthouses' },
      { label: 'Payment Plan', value: '70% During Construction · 30% Handover' },
      { label: 'Target Handover', value: 'Q4 2028' },
    ],
    amenities: [
      'Private resident shoreline & marina promenade',
      'Horizon lap pool overlooking Palm Jumeirah',
      'Dedicated wellness pavilion and private screening lounge',
      'Direct access to Sheikh Zayed Road and Dubai Harbour',
    ],
  },
  {
    slug: 'the-cedar-grove-pavilions',
    refCode: 'LL-PRJ-02',
    title: 'The Cedar Grove Pavilions',
    developer: 'Meraas',
    community: 'Dubai Hills Estate',
    segment: 'RESIDENTIAL',
    status: 'Under Construction',
    startingPriceAed: 8400000,
    startingPriceLabel: 'From AED 8,400,000',
    handoverLabel: 'Q2 2027',
    paymentPlan: '60 / 40 Post-Handover Option',
    unitTypes: '4–5 Bedroom Architectural Villas & Townhouses',
    heroImage: '/images/residence-boutique-facade.jpg',
    gallery: [
      '/images/residence-boutique-facade.jpg',
      '/images/property-golfside-duplex.jpg',
      '/images/hero-villa-dusk.jpg',
    ],
    overview:
      'A low-density collection of 38 architectural courtyard residences built around mature parkland trails, shaded timber pergolas, and generous plots designed for privacy and long-term capital resilience.',
    keyFacts: [
      { label: 'Location', value: 'Dubai Hills Estate' },
      { label: 'Unit Mix', value: '4 & 5 BR Independent Villas' },
      { label: 'Payment Plan', value: '60% Construction · 40% Handover' },
      { label: 'Target Handover', value: 'Q2 2027' },
    ],
    amenities: [
      'Gated parkland enclave with private cycling loop',
      'Shaded architectural timber decks and private gardens',
      'Adjacent to championship golf course and clubhouse',
      'Proximity to Downtown Dubai and Al Maktoum corridor',
    ],
  },
  {
    slug: 'burj-district-private-collection',
    refCode: 'LL-PRJ-03',
    title: 'Burj District Private Collection',
    developer: 'Omniyat',
    community: 'Downtown Dubai',
    segment: 'MIXED-USE',
    status: 'Handover 2026',
    startingPriceAed: 6850000,
    startingPriceLabel: 'From AED 6,850,000',
    handoverLabel: 'Q4 2026',
    paymentPlan: '50 / 50 Handover Milestone',
    unitTypes: '2–4 Bedroom Sky Residences & Private Studios',
    heroImage: '/images/hero-dubai-skyline.jpg',
    gallery: [
      '/images/hero-dubai-skyline.jpg',
      '/images/architecture-glass-towers.jpg',
      '/images/property-sky-penthouse.jpg',
    ],
    overview:
      'Positioned along the cultural axis between Downtown Dubai and DIFC, this sculptural tower offers acoustic sanctuary, museum-quality common spaces, and flexible executive ownership structures.',
    keyFacts: [
      { label: 'Location', value: 'Downtown Dubai · DIFC Corridor' },
      { label: 'Unit Mix', value: '2–4 BR Residences & Penthouses' },
      { label: 'Payment Plan', value: '50% Booking/Construction · 50% Key Handover' },
      { label: 'Target Handover', value: 'Q4 2026' },
    ],
    amenities: [
      'Private residents-only sky club & boardrooms',
      'Chauffeured house car and 24/7 lifestyle concierge',
      'Thermal hydrotherapy spa and indoor 25m lap pool',
      'Five minutes to DIFC Gate Village & Dubai Opera',
    ],
  },
]

export const CORE_SERVICES = [
  {
    id: 'consultancy',
    title: 'Real Estate Consultancy',
    desc: 'Independent, research-backed consultancy, feasibility guidance, and market intelligence for high-value decisions.',
    featured: true,
    tag: 'Core Practice',
  },
  {
    id: 'acquisition',
    title: 'Acquisition Advisory',
    desc: 'Source, evaluate, and negotiate exceptional prime, ready, and off-market properties across Dubai.',
    featured: false,
  },
  {
    id: 'investment',
    title: 'Investment Strategy',
    desc: 'Data-led capital allocation, net yield modelling, and risk-adjusted portfolio planning.',
    featured: false,
  },
  {
    id: 'disposition',
    title: 'Disposition & Sales',
    desc: 'Institutional positioning, discreet buyer qualification, and strategic exit execution.',
    featured: false,
  },
  {
    id: 'portfolio',
    title: 'Portfolio Advisory',
    desc: 'Long-term, multi-asset portfolio structuring and lifecycle governance for private investors and family offices.',
    featured: false,
  },
]

export const FULL_SERVICE_CATALOG = [
  {
    title: 'Real Estate Consultancy',
    desc: 'Independent, strategic guidance anchored by 21+ years of market cycle experience and analytical clarity.',
  },
  {
    title: 'Acquisition Advisory',
    desc: 'Carefully vetted residential and commercial acquisition mandates aligned with personal and investment objectives.',
  },
  {
    title: 'Investment Strategy & Yield Modelling',
    desc: 'Structured return analysis, comparables benchmarking, and capital preservation planning across cycles.',
  },
  {
    title: 'Disposition & Confidential Sales',
    desc: 'Targeted valuation and discreet execution designed to protect asset value and maximize exit terms.',
  },
  {
    title: 'Leasing & Rental Services — Commercial & Residential',
    desc: 'Efficient tenant qualification and leasing strategies that protect long-term asset yield and quality.',
  },
  {
    title: 'Land Acquisition & Site Selection',
    desc: 'Highest-and-best-use land evaluation covering zoning, master-plan infrastructure, and appreciation drivers.',
  },
  {
    title: 'Commercial Evaluation of Development Projects',
    desc: 'In-depth feasibility, pricing architecture, and absorption reviews for developers and institutional capital.',
  },
  {
    title: 'Sales Structuring & Exclusive Project Management',
    desc: 'End-to-end commercial launch strategy, phasing, and channel management for landmark developments.',
  },
  {
    title: 'Portfolio Structuring & Family Office Advisory',
    desc: 'Consolidated multi-asset stewardship focused on long-term wealth preservation over short-term volume.',
  },
]

export const DEVELOPERS = [
  'EMAAR',
  'NAKHEEL',
  'MERAAS',
  'OMNIYAT',
  'SOBHA REALTY',
  'ALDAR',
  'SELECT GROUP',
  'DAMAC',
  'ELLINGTON',
  'MAJID AL FUTTAIM',
  'DUBAI PROPERTIES',
  'AL BARARI',
  'MEYDAN',
  'WASL',
]

export const CLIENT_PERSPECTIVES = [
  {
    initials: 'HA',
    quote:
      'Leap Living brought a level of market insight and disciplined precision that made our Dubai acquisition completely seamless.',
    author: 'Hassan A.',
    role: 'Private Investor',
  },
  {
    initials: 'LK',
    quote:
      'Strategic, transparent, and deeply analytical. A trusted advisory partner across every decision in our regional portfolio.',
    author: 'Leila K.',
    role: 'Family Office Director',
  },
  {
    initials: 'ON',
    quote:
      'Their market intelligence and direct executive relationships unlocked opportunities that simply never reach public portals.',
    author: 'Omar N.',
    role: 'Real Estate Investor',
  },
]
