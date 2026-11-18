import { z } from 'zod'
import type { PropertyListing } from '@/data/catalog'
import {
  formatArea,
  formatMoney,
  imagesSchema,
  lines,
  moneySchema,
  parseJsonArray,
  referenceSchema,
  slugSchema,
  type ListingImage,
} from './shared'

export const PROPERTY_TYPES = ['Villa', 'Penthouse', 'Apartment', 'Duplex', 'Commercial'] as const
export const COMPLETION_STATUSES = ['Ready', 'Off-Plan', 'Leasing Available'] as const
export const AVAILABILITY = {
  AVAILABLE: 'Available',
  UNDER_OFFER: 'Under Offer',
  SOLD: 'Sold',
  RENTED: 'Rented',
  OFF_MARKET: 'Off Market',
} as const
export type AvailabilityStatus = keyof typeof AVAILABILITY

export const propertyInputSchema = z.object({
  title: z.string().trim().min(3, 'Enter a title.').max(140),
  subtitle: z.string().trim().max(200).default(''),
  slug: z.union([z.literal(''), slugSchema]).default(''),
  referenceNumber: referenceSchema,
  transactionType: z.enum(['BUY', 'RENT']),
  segment: z.enum(['RESIDENTIAL', 'COMMERCIAL']),
  propertyType: z.enum(PROPERTY_TYPES),
  availabilityStatus: z.enum(Object.keys(AVAILABILITY) as [AvailabilityStatus]),
  highlightLabel: z.string().trim().max(40).default(''),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0),
  community: z.string().trim().min(2, 'Enter the community.').max(80),
  emirate: z.string().trim().min(2).max(40).default('Dubai'),
  price: moneySchema,
  priceFrequency: z.string().trim().max(20).default(''),
  beds: z.coerce.number().int().min(0).max(50),
  baths: z.coerce.number().int().min(0).max(50),
  area: moneySchema,
  completionStatus: z.enum(COMPLETION_STATUSES),
  developer: z.string().trim().max(80).default(''),
  description: z.string().trim().max(5000).default(''),
  highlights: lines(20),
  images: imagesSchema,
  permitNumber: z.string().trim().max(40).default(''),
})

export type PropertyInput = z.infer<typeof propertyInputSchema>

/** What a listing needs before it can go public (drafts may be incomplete). */
export function propertyPublishProblems(p: { images: string; description: string }): string[] {
  const problems: string[] = []
  if (parseJsonArray(p.images).length === 0) problems.push('Add at least one image.')
  if (!p.description.trim()) problems.push('Add a description.')
  return problems
}

export interface PropertyRow {
  slug: string
  referenceNumber: string
  title: string
  subtitle: string
  transactionType: string
  segment: string
  propertyType: string
  availabilityStatus: string
  highlightLabel: string
  featured: boolean
  community: string
  emirate: string
  price: { toString(): string }
  currency: string
  priceFrequency: string
  beds: number
  baths: number
  area: { toString(): string }
  areaUnit: string
  completionStatus: string
  developer: string
  description: string
  highlights: string
  images: string
}

/** Database row -> the shape the public components render. */
export function toPropertyListing(row: PropertyRow): PropertyListing {
  const images = parseJsonArray<ListingImage>(row.images)
  const availability = row.availabilityStatus as AvailabilityStatus
  const price = Number(row.price.toString())
  const area = Number(row.area.toString())
  return {
    slug: row.slug,
    refCode: row.referenceNumber,
    transactionType: row.transactionType as PropertyListing['transactionType'],
    segment: row.segment as PropertyListing['segment'],
    statusLabel:
      availability !== 'AVAILABLE' && AVAILABILITY[availability]
        ? AVAILABILITY[availability]
        : row.highlightLabel || row.completionStatus,
    featured: row.featured,
    title: row.title,
    subtitle: row.subtitle,
    community: row.community,
    emirate: row.emirate,
    propertyType: row.propertyType as PropertyListing['propertyType'],
    priceAed: price,
    priceLabel: formatMoney(row.price.toString(), row.currency),
    ...(row.priceFrequency ? { priceFrequency: row.priceFrequency } : {}),
    beds: row.beds,
    baths: row.baths,
    areaSqFt: area,
    areaFormatted: formatArea(row.area.toString(), row.areaUnit),
    completionStatus: row.completionStatus as PropertyListing['completionStatus'],
    heroImage: images[0]?.url ?? '/images/hero-dubai-skyline.jpg',
    gallery: images.map((image) => image.url),
    description: row.description,
    highlights: parseJsonArray<string>(row.highlights),
    developer: row.developer,
  }
}

/** Starter catalogue entry -> database row (seed). */
export function propertyFromCatalog(p: PropertyListing, sortOrder: number) {
  return {
    slug: p.slug,
    referenceNumber: p.refCode,
    title: p.title,
    subtitle: p.subtitle,
    transactionType: p.transactionType,
    segment: p.segment,
    propertyType: p.propertyType,
    publicationStatus: 'PUBLISHED',
    availabilityStatus: 'AVAILABLE',
    highlightLabel: p.statusLabel,
    featured: p.featured,
    sortOrder,
    community: p.community,
    emirate: p.emirate,
    price: String(p.priceAed),
    priceFrequency: p.priceFrequency ?? '',
    beds: p.beds,
    baths: p.baths,
    area: String(p.areaSqFt),
    completionStatus: p.completionStatus,
    developer: p.developer,
    description: p.description,
    highlights: JSON.stringify(p.highlights),
    images: JSON.stringify(p.gallery.map((url) => ({ url, alt: '' }))),
    publishedAt: new Date(),
  }
}
