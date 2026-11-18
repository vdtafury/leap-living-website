import { z } from 'zod'
import type { ProjectItem } from '@/data/catalog'
import {
  formatMoney,
  imagesSchema,
  lines,
  moneySchema,
  parseJsonArray,
  referenceSchema,
  slugSchema,
  type ListingImage,
} from './shared'

export const PROJECT_STAGE_SUGGESTIONS = ['Off-Plan', 'Under Construction', 'Ready'] as const

const keyFactSchema = z.object({
  label: z.string().trim().min(1).max(60),
  value: z.string().trim().min(1).max(160),
})

export const projectInputSchema = z.object({
  title: z.string().trim().min(3, 'Enter a title.').max(140),
  slug: z.union([z.literal(''), slugSchema]).default(''),
  referenceNumber: referenceSchema,
  developer: z.string().trim().max(80).default(''),
  community: z.string().trim().min(2, 'Enter the community.').max(80),
  segment: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED-USE']),
  status: z.string().trim().min(2, 'Enter the delivery stage.').max(40),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0),
  startingPrice: moneySchema,
  handoverLabel: z.string().trim().max(40).default(''),
  paymentPlan: z.string().trim().max(120).default(''),
  unitTypes: z.string().trim().max(160).default(''),
  overview: z.string().trim().max(5000).default(''),
  keyFacts: z.array(keyFactSchema).max(12, 'Up to 12 key facts.'),
  amenities: lines(20),
  images: imagesSchema,
})

export type ProjectInput = z.infer<typeof projectInputSchema>

export function projectPublishProblems(p: { images: string; overview: string }): string[] {
  const problems: string[] = []
  if (parseJsonArray(p.images).length === 0) problems.push('Add at least one image.')
  if (!p.overview.trim()) problems.push('Add an overview.')
  return problems
}

export interface ProjectRow {
  /** Absent for unsaved admin previews */
  id?: string
  slug: string
  referenceNumber: string
  title: string
  developer: string
  community: string
  segment: string
  status: string
  startingPrice: { toString(): string }
  currency: string
  handoverLabel: string
  paymentPlan: string
  unitTypes: string
  overview: string
  keyFacts: string
  amenities: string
  images: string
}

export function toProjectItem(row: ProjectRow): ProjectItem {
  const images = parseJsonArray<ListingImage>(row.images)
  return {
    id: row.id,
    slug: row.slug,
    refCode: row.referenceNumber,
    title: row.title,
    developer: row.developer,
    community: row.community,
    segment: row.segment as ProjectItem['segment'],
    status: row.status,
    startingPriceAed: Number(row.startingPrice.toString()),
    startingPriceLabel: `From ${formatMoney(row.startingPrice.toString(), row.currency)}`,
    handoverLabel: row.handoverLabel,
    paymentPlan: row.paymentPlan,
    unitTypes: row.unitTypes,
    heroImage: images[0]?.url ?? '/images/hero-dubai-skyline.jpg',
    gallery: images.map((image) => image.url),
    overview: row.overview,
    keyFacts: parseJsonArray<{ label: string; value: string }>(row.keyFacts),
    amenities: parseJsonArray<string>(row.amenities),
  }
}

export function projectFromCatalog(p: ProjectItem, sortOrder: number) {
  return {
    slug: p.slug,
    referenceNumber: p.refCode,
    title: p.title,
    developer: p.developer,
    community: p.community,
    segment: p.segment,
    status: p.status,
    publicationStatus: 'PUBLISHED',
    featured: true,
    sortOrder,
    startingPrice: String(p.startingPriceAed),
    handoverLabel: p.handoverLabel,
    paymentPlan: p.paymentPlan,
    unitTypes: p.unitTypes,
    overview: p.overview,
    keyFacts: JSON.stringify(p.keyFacts),
    amenities: JSON.stringify(p.amenities),
    images: JSON.stringify(p.gallery.map((url) => ({ url, alt: '' }))),
    publishedAt: new Date(),
  }
}
