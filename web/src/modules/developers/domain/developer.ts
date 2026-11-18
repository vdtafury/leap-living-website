import { z } from 'zod'
import type { DeveloperBrand } from '@/data/catalog'
import { imageUrlSchema } from '@/modules/listings'

export const developerInputSchema = z.object({
  name: z.string().trim().min(2, 'Enter the developer name.').max(60),
  /** Empty = the name is shown as a typographic wordmark */
  logoUrl: z.union([z.literal(''), imageUrlSchema]).default(''),
  logoWidth: z.coerce.number().int().min(16, 'Width 16–240 px.').max(240, 'Width 16–240 px.'),
  logoHeight: z.coerce.number().int().min(12, 'Height 12–80 px.').max(80, 'Height 12–80 px.'),
  isVisible: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0),
})

export type DeveloperInput = z.infer<typeof developerInputSchema>

export function toDeveloperBrand(row: {
  name: string
  logoUrl: string
  logoWidth: number
  logoHeight: number
}): DeveloperBrand {
  return {
    name: row.name,
    ...(row.logoUrl ? { logo: row.logoUrl } : {}),
    width: row.logoWidth,
    height: row.logoHeight,
  }
}
