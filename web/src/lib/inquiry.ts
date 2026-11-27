import { z } from 'zod'

// No runtime code generation: zod would otherwise probe `new Function` for speed, which the
// site's Content-Security-Policy (no 'unsafe-eval') reports as a violation in the browser.
z.config({ jitless: true })

/** Shared by the form (client) and /api/inquiries (server). */
export const INQUIRY_TYPES = [
  'CONSULTATION',
  'VALUATION',
  'LIST_PROPERTY',
  'PROPERTY_INQUIRY',
  'PROJECT_BRIEFING',
] as const
export type InquiryType = (typeof INQUIRY_TYPES)[number]

export const MAX_INQUIRY_BYTES = 16 * 1024

const emailCheck = z.email('Please enter a valid email address')

export const inquirySchema = z
  .object({
    type: z.enum(INQUIRY_TYPES),
    name: z.string().trim().min(2, 'Please enter your full name').max(120),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(/^\+?[\d\s().-]{7,}$/, 'Please enter a valid phone number'),
    email: z.string().trim().max(254).default(''),
    interest: z.string().trim().min(2, 'Please fill in this field').max(200),
    notes: z.string().trim().max(2000).default(''),
    context: z.string().trim().max(200).optional(),
    pagePath: z.string().trim().max(300).optional(),
    listingType: z.enum(['PROPERTY', 'PROJECT']).optional(),
    listingId: z.string().trim().max(64).optional(),
    /** Honeypot: hidden from people, so only bots fill it. */
    website: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    // Quick "List with us" form collects only name, phone, and community; other forms require email.
    if (data.type === 'LIST_PROPERTY' && data.email === '') return
    if (!emailCheck.safeParse(data.email).success) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Please enter a valid email address',
      })
    }
  })

export type InquiryInput = z.input<typeof inquirySchema>
export type Inquiry = z.output<typeof inquirySchema>

/** First error message per field, for showing next to the inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    out[key] ??= issue.message
  }
  return out
}
