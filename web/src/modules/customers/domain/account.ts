import { z } from 'zod'

// Same as src/lib/inquiry.ts: no runtime code generation (CSP has no 'unsafe-eval').
z.config({ jitless: true })

/**
 * Website accounts (D-40): pure rules, no I/O. Shared by the account pages (client hints) and
 * the server (the real check).
 */

export const FAVORITE_TYPES = ['PROPERTY', 'PROJECT'] as const
export type FavoriteType = (typeof FAVORITE_TYPES)[number]

/** Upper bound per account, so one account cannot grow the table without limit. */
export const MAX_FAVORITES = 500

/** `PROPERTY:<id>` / `PROJECT:<id>`: one string per saved item, used in the browser state. */
export const favoriteKey = (type: FavoriteType, id: string) => `${type}:${id}`

const FAVORITE_KEY = /^(PROPERTY|PROJECT):([a-z0-9]{8,40})$/

export function parseFavoriteKey(value: unknown): { type: FavoriteType; id: string } | null {
  if (typeof value !== 'string') return null
  const match = FAVORITE_KEY.exec(value)
  return match ? { type: match[1] as FavoriteType, id: match[2] } : null
}

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'Use at most 254 characters.')
  .pipe(z.email('Enter a valid email address.'))

const nameField = z
  .string()
  .trim()
  .min(2, 'Enter your full name.')
  .max(100, 'Use at most 100 characters.')

/** Optional; when given, the same shape the enquiry forms accept. */
const phoneField = z
  .string()
  .trim()
  .max(40, 'Use at most 40 characters.')
  .refine((v) => v === '' || /^\+?[\d\s().-]{7,}$/.test(v), 'Enter a valid phone number.')

export const signUpSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField.default(''),
  password: z.string().max(256),
})
export type SignUpInput = z.input<typeof signUpSchema>

export const profileSchema = z.object({ name: nameField, phone: phoneField.default('') })
export type ProfileInput = z.input<typeof profileSchema>

export const emailSchema = emailField

/**
 * Where to go after signing in. Only a path on this site, and never the admin or the API:
 * an attacker-supplied `next` must not turn the sign-in page into an open redirect.
 */
export function safeNextPath(value: unknown, fallback = '/account'): string {
  if (typeof value !== 'string' || value.length > 300) return fallback
  if (!/^\/(?![/\\])[\w\-./?=&%#~]*$/.test(value)) return fallback
  if (/^\/(admin|api)(\/|\?|#|$)/.test(value)) return fallback
  return value
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? ''
