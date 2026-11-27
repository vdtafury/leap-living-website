import { z } from 'zod'

/** A listing is public only when PUBLISHED and not deleted. The single source of that rule. */
export const PUBLIC_WHERE = { publicationStatus: 'PUBLISHED', deletedAt: null } as const

export const PUBLICATION_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number]

export interface ListingImage {
  url: string
  alt: string
}

/**
 * Images may point at the site's own files (`/images/...`, `/media/<file>`) or trusted HTTPS
 * hosts used by Pixxi CRM media storage. Arbitrary external URLs and path traversal are rejected.
 */
const LOCAL_IMAGE_PATH = /^\/(images|media)\/[A-Za-z0-9][A-Za-z0-9._/-]*$/
const TRUSTED_CRM_IMAGE_URL =
  /^https:\/\/([a-z0-9-]+\.)*(pixxicrm\.(ae|com)|amazonaws\.com|cloudfront\.net|digitaloceanspaces\.com|aliyuncs\.com|storage\.googleapis\.com|blob\.core\.windows\.net)\/[^\s<>"]+$/i

export const imageUrlSchema = z
  .string()
  .trim()
  .max(600)
  .refine(
    (url) =>
      (LOCAL_IMAGE_PATH.test(url) && !url.includes('..') && !url.includes('//')) ||
      TRUSTED_CRM_IMAGE_URL.test(url),
    'Image must be an uploaded file or a Pixxi CRM image URL.',
  )

export const imageSchema = z.object({
  url: imageUrlSchema,
  alt: z.string().trim().max(200).default(''),
})

export const imagesSchema = z.array(imageSchema).max(30, 'Up to 30 images.')

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, digits and single dashes.')

export const referenceSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9][A-Z0-9-]{2,29}$/, 'Use 3–30 capital letters, digits or dashes.')

/** Positive amount with up to two decimals, kept as a string so no float rounding happens. */
export const moneySchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[,\s]/g, ''))
  .refine((v) => /^\d{1,12}(\.\d{1,2})?$/.test(v) && Number(v) > 0, 'Enter a positive amount.')

export const lines = (max: number, maxLength = 200) =>
  z.array(z.string().trim().min(1).max(maxLength)).max(max, `Up to ${max} lines.`)

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export function parseJsonArray<T>(value: string | null | undefined): T[] {
  try {
    const parsed = JSON.parse(value ?? '[]')
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

const groupDigits = (value: number | string) =>
  Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })

export const formatMoney = (amount: number | string, currency = 'AED') =>
  `${currency} ${groupDigits(amount)}`

export const formatArea = (area: number | string, unit = 'sq ft') => `${groupDigits(area)} ${unit}`
