/**
 * Pure domain layer for Pixxi CRM integration (https://api-docs.pixxicrm.com/).
 * Zero framework, server, or database imports (AGENTS.md §5).
 */

export const PIXXI_DEFAULT_BASE_URL = 'https://dataapi.pixxicrm.ae'
export const PIXXI_LISTING_TYPES = ['SELL', 'RENT', 'NEW'] as const
export type PixxiListingType = (typeof PIXXI_LISTING_TYPES)[number]

/** Retry backoff for failed Pixxi lead pushes: 1m -> 5m -> 15m -> 1h -> 6h (6 total attempts). */
export const PIXXI_BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 6 * 60 * 60_000]
export const PIXXI_MAX_ATTEMPTS = PIXXI_BACKOFF_MS.length + 1

export function nextPixxiRetryDelay(attempts: number): number | null {
  return attempts >= PIXXI_MAX_ATTEMPTS
    ? null
    : PIXXI_BACKOFF_MS[Math.min(Math.max(0, attempts - 1), PIXXI_BACKOFF_MS.length - 1)]
}

export interface PixxiFormTarget {
  formId: string
  formName: string
}

export interface PixxiConfig {
  enabled: boolean
  apiToken: string
  baseUrl: string
  forms: {
    general: PixxiFormTarget
    listing: PixxiFormTarget
    buy: PixxiFormTarget
    rent: PixxiFormTarget
    sell: PixxiFormTarget
  }
  webhookSecret: string
  syncIntervalMinutes: number
  hideStarterOnSync: boolean
}

type Env = Record<string, string | undefined>

const clean = (value: string | undefined) => (value ?? '').trim()

export function readPixxiConfig(env: Env = process.env): PixxiConfig {
  const apiToken = clean(env.PIXXI_API_TOKEN)
  const rawBase = clean(env.PIXXI_API_BASE_URL) || PIXXI_DEFAULT_BASE_URL
  const baseUrl = rawBase.replace(/\/+$/, '')

  const general: PixxiFormTarget = {
    formId: clean(env.PIXXI_FORM_GENERAL_ID),
    formName: clean(env.PIXXI_FORM_GENERAL_NAME) || 'Website General Leads',
  }
  const listing: PixxiFormTarget = {
    formId: clean(env.PIXXI_FORM_LISTING_ID) || general.formId,
    formName: clean(env.PIXXI_FORM_LISTING_NAME) || 'Website Listing Leads',
  }
  const buy: PixxiFormTarget = {
    formId: clean(env.PIXXI_FORM_BUY_ID) || general.formId,
    formName: clean(env.PIXXI_FORM_BUY_NAME) || general.formName,
  }
  const rent: PixxiFormTarget = {
    formId: clean(env.PIXXI_FORM_RENT_ID) || general.formId,
    formName: clean(env.PIXXI_FORM_RENT_NAME) || general.formName,
  }
  const sell: PixxiFormTarget = {
    formId: clean(env.PIXXI_FORM_SELL_ID) || general.formId,
    formName: clean(env.PIXXI_FORM_SELL_NAME) || general.formName,
  }

  const parsedInterval = Number(clean(env.PIXXI_SYNC_INTERVAL_MINUTES) || '15')
  const syncIntervalMinutes = Number.isFinite(parsedInterval)
    ? Math.min(1440, Math.max(5, Math.floor(parsedInterval)))
    : 15

  return {
    enabled: apiToken.length > 0,
    apiToken,
    baseUrl,
    forms: { general, listing, buy, rent, sell },
    webhookSecret: clean(env.PIXXI_WEBHOOK_SECRET),
    syncIntervalMinutes,
    hideStarterOnSync: clean(env.PIXXI_HIDE_STARTER_ON_SYNC).toLowerCase() !== 'false',
  }
}

/** Picks the right Pixxi Form target based on inquiry intent and whether a Pixxi listing is linked. */
export function resolvePixxiForm(
  inquiryType: string,
  pixxiPropertyId: string | null | undefined,
  config: PixxiConfig,
): PixxiFormTarget {
  if (pixxiPropertyId && config.forms.listing.formId) return config.forms.listing
  if (inquiryType === 'VALUATION' || inquiryType === 'LIST_PROPERTY') return config.forms.sell
  if (inquiryType === 'PROPERTY_INQUIRY' || inquiryType === 'PROJECT_BRIEFING') {
    return config.forms.listing.formId ? config.forms.listing : config.forms.buy
  }
  return config.forms.general
}

export interface LeadSubmissionInput {
  id: string
  type: string
  name: string
  email: string
  phone: string
  interest: string
  notes: string
  context?: string | null
  pagePath?: string | null
}

/** Builds the JSON body expected by POST /pixxiapi/webhook/v1/form. */
export function buildPixxiLeadPayload(
  inquiry: LeadSubmissionInput,
  pixxiPropertyId: string | null | undefined,
  form: PixxiFormTarget,
): Record<string, unknown> {
  const extraData: Record<string, string> = {
    inquiryType: inquiry.type,
    interest: inquiry.interest,
    sourceReference: inquiry.id,
  }
  if (inquiry.context) extraData.context = inquiry.context
  if (inquiry.notes) extraData.notes = inquiry.notes
  if (inquiry.pagePath) extraData.pagePath = inquiry.pagePath

  return {
    formId: form.formId,
    formName: form.formName,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    ...(pixxiPropertyId ? { propertyId: pixxiPropertyId } : {}),
    extraData,
  }
}

/* ------------------------------------------------------------------ Pixxi listing mappers */

export interface PixxiRawListing {
  id?: string | number | null
  propertyId?: string | number | null
  listingType?: string | null
  title?: string | null
  description?: string | null
  price?: number | string | null
  size?: number | string | null
  bedRooms?: number | string | null
  bedrooms?: number | string | null
  bathrooms?: number | string | null
  propertyType?: string | string[] | null
  status?: string | null
  community?: string | null
  region?: string | null
  cityName?: string | null
  emirate?: string | null
  developer?: string | null
  developerName?: string | null
  permitNumber?: string | null
  reraNumber?: string | null
  photos?: unknown
  images?: unknown
  amenities?: unknown
  sellParam?: Record<string, unknown> | null
  rentParam?: Record<string, unknown> | null
  newParam?: Record<string, unknown> | null
  [key: string]: unknown
}

export interface MappedPixxiProperty {
  pixxiId: string
  pixxiNumericId: string | null
  listingType: 'SELL' | 'RENT'
  slug: string
  referenceNumber: string
  title: string
  subtitle: string
  transactionType: 'BUY' | 'RENT'
  segment: 'RESIDENTIAL' | 'COMMERCIAL'
  propertyType: 'Villa' | 'Penthouse' | 'Apartment' | 'Duplex' | 'Commercial'
  publicationStatus: 'PUBLISHED' | 'DRAFT'
  availabilityStatus: 'AVAILABLE' | 'UNDER_OFFER' | 'SOLD' | 'RENTED' | 'OFF_MARKET'
  highlightLabel: string
  community: string
  emirate: string
  price: string
  currency: string
  priceFrequency: string
  beds: number
  baths: number
  area: string
  areaUnit: string
  completionStatus: 'Ready' | 'Off-Plan' | 'Leasing Available'
  developer: string
  description: string
  highlights: string[]
  images: { url: string; alt: string }[]
  permitNumber: string | null
}

export interface MappedPixxiProject {
  pixxiId: string
  pixxiNumericId: string | null
  listingType: 'NEW'
  slug: string
  referenceNumber: string
  title: string
  developer: string
  community: string
  segment: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED-USE'
  status: string
  publicationStatus: 'PUBLISHED' | 'DRAFT'
  startingPrice: string
  currency: string
  handoverLabel: string
  paymentPlan: string
  unitTypes: string
  overview: string
  keyFacts: { label: string; value: string }[]
  amenities: string[]
  images: { url: string; alt: string }[]
}

const str = (v: unknown, max = 500): string =>
  typeof v === 'string'
    ? v.trim().slice(0, max)
    : typeof v === 'number' && Number.isFinite(v)
      ? String(v)
      : ''

/** Strips HTML tags and normalizes whitespace from Pixxi rich-text descriptions. */
export function stripHtml(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function slugPart(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function safeHttpsUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > 600 || /[\s<>"]/.test(trimmed)) return null
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:') return null
    if (parsed.username || parsed.password) return null
    return parsed.toString()
  } catch {
    return null
  }
}

function extractImages(raw: PixxiRawListing, title: string): { url: string; alt: string }[] {
  const candidates = Array.isArray(raw.photos)
    ? raw.photos
    : Array.isArray(raw.images)
      ? raw.images
      : []
  const out: { url: string; alt: string }[] = []
  const seen = new Set<string>()
  for (const item of candidates) {
    const rawUrl =
      typeof item === 'string'
        ? item
        : item && typeof item === 'object' && 'url' in item
          ? (item as { url?: unknown }).url
          : null
    const url = safeHttpsUrl(rawUrl)
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push({ url, alt: title.slice(0, 120) })
    if (out.length >= 30) break
  }
  return out
}

function extractStrings(value: unknown, maxItems = 20): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const item of value) {
    const text =
      typeof item === 'string'
        ? item.trim()
        : item && typeof item === 'object' && 'name' in item
          ? str((item as { name?: unknown }).name, 120)
          : ''
    if (!text || seen.has(text)) continue
    seen.add(text)
    out.push(text.slice(0, 160))
    if (out.length >= maxItems) break
  }
  return out
}

function parsePositiveNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[,\s]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

function parseNonNegInt(value: unknown, max = 50): number {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(max, Math.round(n))
}

function classifyPropertyType(rawType: unknown): {
  propertyType: MappedPixxiProperty['propertyType']
  segment: 'RESIDENTIAL' | 'COMMERCIAL'
} {
  const first = Array.isArray(rawType) ? str(rawType[0]) : str(rawType)
  const upper = first.toUpperCase()
  if (
    upper.includes('COMMERCIAL') ||
    upper.includes('OFFICE') ||
    upper.includes('RETAIL') ||
    upper.includes('SHOP') ||
    upper.includes('WAREHOUSE') ||
    upper.includes('SHOWROOM') ||
    upper.includes('FACTORY') ||
    upper.includes('HOTEL') ||
    upper.includes('BUILDING')
  ) {
    return { propertyType: 'Commercial', segment: 'COMMERCIAL' }
  }
  if (upper.includes('PENTHOUSE')) return { propertyType: 'Penthouse', segment: 'RESIDENTIAL' }
  if (upper.includes('DUPLEX')) return { propertyType: 'Duplex', segment: 'RESIDENTIAL' }
  if (upper.includes('VILLA') || upper.includes('TOWNHOUSE') || upper.includes('COMPOUND')) {
    return { propertyType: 'Villa', segment: 'RESIDENTIAL' }
  }
  return { propertyType: 'Apartment', segment: 'RESIDENTIAL' }
}

function makeReference(pixxiId: string, prefix: string): string {
  const cleaned = pixxiId.toUpperCase().replace(/[^A-Z0-9-]/g, '')
  if (cleaned.length >= 3 && cleaned.length <= 30 && /^[A-Z0-9]/.test(cleaned)) {
    return cleaned
  }
  return `${prefix}-${cleaned || 'ITEM'}`.slice(0, 30)
}

export function extractPixxiId(raw: PixxiRawListing): {
  pixxiId: string
  pixxiNumericId: string | null
} | null {
  const propId = str(raw.propertyId, 80)
  const numId = str(raw.id, 80)
  const pixxiId = propId || numId
  if (!pixxiId) return null
  return { pixxiId, pixxiNumericId: numId || null }
}

export function mapPixxiToProperty(
  raw: PixxiRawListing,
  fallbackType: 'SELL' | 'RENT' = 'SELL',
): MappedPixxiProperty | null {
  const ids = extractPixxiId(raw)
  if (!ids) return null

  const listingType = str(raw.listingType).toUpperCase() === 'RENT' ? 'RENT' : fallbackType
  const title = str(raw.title, 140) || `Property ${ids.pixxiId}`
  const community = str(raw.community, 80) || str(raw.region, 80) || 'Dubai'
  const emirate = str(raw.cityName, 40) || str(raw.emirate, 40) || 'Dubai'
  const { propertyType, segment } = classifyPropertyType(raw.propertyType)

  const sellParam = raw.sellParam ?? {}
  const rentParam = raw.rentParam ?? {}
  const priceNum = parsePositiveNumber(raw.price)
  const areaNum = parsePositiveNumber(raw.size) ?? 1

  const rawBeds = raw.bedRooms ?? raw.bedrooms ?? sellParam.bedrooms ?? rentParam.bedrooms
  const rawBaths = raw.bathrooms ?? sellParam.bathrooms ?? rentParam.bathrooms
  const beds = parseNonNegInt(rawBeds, 50)
  const baths = parseNonNegInt(rawBaths, 50)

  const description = stripHtml(str(raw.description, 10000)).slice(0, 5000)
  const subtitle = description.split(/\n|\.\s/)[0]?.trim().slice(0, 200) ?? ''
  const images = extractImages(raw, title)
  const highlights = extractStrings(raw.amenities, 20)
  const developer = str(raw.developerName, 80) || str(raw.developer, 80)
  const permitNumber =
    str(raw.permitNumber, 40) ||
    str(raw.reraNumber, 40) ||
    str(sellParam.permitNumber, 40) ||
    str(rentParam.permitNumber, 40) ||
    null

  const statusUpper = str(raw.status).toUpperCase()
  let availabilityStatus: MappedPixxiProperty['availabilityStatus'] = 'AVAILABLE'
  if (statusUpper.includes('SOLD')) availabilityStatus = 'SOLD'
  else if (statusUpper.includes('RENTED')) availabilityStatus = 'RENTED'
  else if (statusUpper.includes('OFFER') || statusUpper.includes('RESERVED'))
    availabilityStatus = 'UNDER_OFFER'
  else if (statusUpper.includes('INACTIVE') || statusUpper.includes('OFF_MARKET'))
    availabilityStatus = 'OFF_MARKET'

  const sellCompletion = str(sellParam.completionStatus).toUpperCase()
  const completionStatus: MappedPixxiProperty['completionStatus'] =
    listingType === 'RENT'
      ? 'Leasing Available'
      : sellCompletion.includes('OFF')
        ? 'Off-Plan'
        : 'Ready'

  const rentPeriod = str(rentParam.priceType).toUpperCase()
  const priceFrequency =
    listingType === 'RENT'
      ? rentPeriod === 'MONTH'
        ? '/ month'
        : rentPeriod === 'WEEK'
          ? '/ week'
          : rentPeriod === 'DAY'
            ? '/ day'
            : '/ year'
      : ''

  const referenceNumber = makeReference(ids.pixxiId, listingType === 'RENT' ? 'PX-RENT' : 'PX-BUY')
  const slugBase = slugPart(title) || 'listing'
  const slugSuffix = slugPart(ids.pixxiId).slice(-16) || 'item'
  const slug = `${slugBase}-${slugSuffix}`.slice(0, 120)

  // Publish only complete listings (AGENTS.md §2.6: Draft != Published)
  const canPublish = Boolean(priceNum && images.length > 0 && description.length > 0)

  return {
    pixxiId: ids.pixxiId,
    pixxiNumericId: ids.pixxiNumericId,
    listingType,
    slug,
    referenceNumber,
    title,
    subtitle,
    transactionType: listingType === 'RENT' ? 'RENT' : 'BUY',
    segment,
    propertyType,
    publicationStatus: canPublish ? 'PUBLISHED' : 'DRAFT',
    availabilityStatus,
    highlightLabel: '',
    community,
    emirate,
    price: String(priceNum ?? 0),
    currency: 'AED',
    priceFrequency,
    beds,
    baths,
    area: String(areaNum),
    areaUnit: 'sq ft',
    completionStatus,
    developer,
    description,
    highlights,
    images,
    permitNumber,
  }
}

export function mapPixxiToProject(raw: PixxiRawListing): MappedPixxiProject | null {
  const ids = extractPixxiId(raw)
  if (!ids) return null

  const newParam = raw.newParam ?? {}
  const title = str(raw.title, 140) || `Project ${ids.pixxiId}`
  const developer = str(raw.developerName, 80) || str(raw.developer, 80)
  const community = str(raw.community, 80) || str(raw.region, 80) || 'Dubai'
  const priceNum = parsePositiveNumber(raw.price)
  const overview = stripHtml(str(raw.description, 10000)).slice(0, 5000)
  const images = extractImages(raw, title)
  const amenities = extractStrings(raw.amenities, 20)

  const handoverRaw = str(newParam.handoverTime, 40)
  const handoverLabel = handoverRaw || 'TBA'
  const paymentPlan = str(newParam.paymentPlan, 120)

  const bedMin = str(newParam.bedroomMin, 10)
  const bedMax = str(newParam.bedroomMax, 10)
  const unitTypesFromType = Array.isArray(raw.propertyType)
    ? raw.propertyType.map((t) => str(t, 30)).filter(Boolean).join(', ')
    : str(raw.propertyType, 80)
  const unitTypes =
    bedMin && bedMax
      ? `${bedMin}–${bedMax} Bedroom ${unitTypesFromType || 'Residences'}`.slice(0, 160)
      : unitTypesFromType || 'Residences'

  const minSize = parsePositiveNumber(newParam.minSize ?? raw.size)
  const maxSize = parsePositiveNumber(newParam.maxSize)
  const totalUnits = parsePositiveNumber(newParam.totalUnits)

  const keyFacts: { label: string; value: string }[] = []
  if (developer) keyFacts.push({ label: 'Developer', value: developer })
  if (handoverRaw) keyFacts.push({ label: 'Handover', value: handoverRaw })
  if (minSize && maxSize && maxSize > minSize) {
    keyFacts.push({
      label: 'Size Range',
      value: `${Math.round(minSize).toLocaleString('en-US')}–${Math.round(maxSize).toLocaleString('en-US')} sq ft`,
    })
  } else if (minSize) {
    keyFacts.push({ label: 'From Size', value: `${Math.round(minSize).toLocaleString('en-US')} sq ft` })
  }
  if (totalUnits) keyFacts.push({ label: 'Total Units', value: String(Math.round(totalUnits)) })

  const { segment: baseSegment } = classifyPropertyType(raw.propertyType)
  const segment: MappedPixxiProject['segment'] =
    Array.isArray(raw.propertyType) && raw.propertyType.length > 2 ? 'MIXED-USE' : baseSegment

  const referenceNumber = makeReference(ids.pixxiId, 'PX-PRJ')
  const slugBase = slugPart(title) || 'project'
  const slugSuffix = slugPart(ids.pixxiId).slice(-16) || 'item'
  const slug = `${slugBase}-${slugSuffix}`.slice(0, 120)

  const canPublish = Boolean(priceNum && images.length > 0 && overview.length > 0)

  return {
    pixxiId: ids.pixxiId,
    pixxiNumericId: ids.pixxiNumericId,
    listingType: 'NEW',
    slug,
    referenceNumber,
    title,
    developer,
    community,
    segment,
    status: handoverRaw ? `Handover ${handoverRaw}`.slice(0, 40) : 'Off-Plan',
    publicationStatus: canPublish ? 'PUBLISHED' : 'DRAFT',
    startingPrice: String(priceNum ?? 0),
    currency: 'AED',
    handoverLabel,
    paymentPlan,
    unitTypes,
    overview,
    keyFacts: keyFacts.slice(0, 12),
    amenities,
    images,
  }
}
