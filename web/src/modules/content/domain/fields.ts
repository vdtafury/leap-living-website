import { z } from 'zod'

/**
 * Field descriptors: one definition drives both the server-side validation (Zod, below) and
 * the admin editor form (src/app/admin/content/editor.tsx). Plain JSON, so it can be passed
 * to a client component.
 */
export type Field =
  | { kind: 'text'; label: string; max: number; optional?: boolean; help?: string }
  | { kind: 'textarea'; label: string; max: number; optional?: boolean; help?: string }
  | { kind: 'href'; label: string; help?: string }
  | { kind: 'url'; label: string; optional?: boolean; help?: string }
  | { kind: 'email'; label: string; optional?: boolean; help?: string }
  /** An uploaded image (/media/…) or a built-in one (/images/…); the editor shows an upload button. */
  | { kind: 'image'; label: string; optional?: boolean; help?: string }
  | { kind: 'number'; label: string; min: number; max: number; step?: number; help?: string }
  | { kind: 'boolean'; label: string; help?: string }
  | {
      kind: 'select'
      label: string
      options: { value: string; label: string }[]
      /** Used when the saved value is missing (a select added after content was saved). */
      default?: string
      help?: string
    }
  | {
      kind: 'list'
      label: string
      itemLabel: string
      min: number
      max: number
      /** A record = list of objects; a single Field = list of plain values */
      item: Fields | Field
      help?: string
    }
  | { kind: 'group'; label: string; fields: Fields }

export type Fields = { [key: string]: Field }

export interface SectionDef {
  label: string
  help?: string
  fields: Fields
}

/** Site links: an internal path, https, mailto: or tel:. Never javascript:, data:, or // / /\. */
const HREF = /^(\/(?![/\\])[^\s<>"]*|https:\/\/[^\s<>"]+|mailto:[^\s<>"]+|tel:\+?[0-9]{6,16})$/

/** Same rule as listing photos: only files served by the site itself. */
const IMAGE = /^\/(images|media)\/[A-Za-z0-9][A-Za-z0-9._/-]*$/

export const isFieldMap = (item: Fields | Field): item is Fields =>
  typeof (item as Field).kind !== 'string'

function fieldSchema(field: Field): z.ZodType {
  switch (field.kind) {
    case 'text':
    case 'textarea': {
      const base = z
        .string()
        .trim()
        .max(field.max, `${field.label}: at most ${field.max} characters.`)
      return field.optional ? base : base.min(1, `${field.label} is required.`)
    }
    case 'href':
      return z
        .string()
        .trim()
        .max(300)
        .regex(HREF, `${field.label}: enter a path like /buy or an https:// link.`)
    case 'url': {
      const url = z
        .string()
        .trim()
        .max(300)
        .regex(/^https:\/\/[^\s<>"]+$/, `${field.label}: enter an https:// link.`)
      return field.optional ? z.union([z.literal(''), url]) : url
    }
    case 'email': {
      const email = z.string().trim().email(`${field.label}: enter a valid email.`).max(120)
      return field.optional ? z.union([z.literal(''), email]) : email
    }
    case 'image': {
      const image = z
        .string()
        .trim()
        .max(300)
        .regex(IMAGE, `${field.label}: upload an image.`)
        .refine(
          (url) => !url.includes('..') && !url.includes('//'),
          `${field.label}: invalid path.`,
        )
      return field.optional ? z.union([z.literal(''), image]) : image
    }
    case 'number':
      return z.coerce
        .number()
        .min(field.min, `${field.label}: at least ${field.min}.`)
        .max(field.max, `${field.label}: at most ${field.max}.`)
    case 'boolean':
      return z.boolean()
    case 'select': {
      const choice = z.enum(field.options.map((o) => o.value) as [string, ...string[]])
      return field.default ? choice.default(field.default) : choice
    }
    case 'list': {
      const item = isFieldMap(field.item) ? objectSchema(field.item) : fieldSchema(field.item)
      return z
        .array(item)
        .min(field.min, `${field.label}: at least ${field.min}.`)
        .max(field.max, `${field.label}: at most ${field.max}.`)
    }
    case 'group':
      return objectSchema(field.fields)
  }
}

export function objectSchema(fields: Fields) {
  return z.object(Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, fieldSchema(f)])))
}

export function documentSchema(sections: Record<string, SectionDef>) {
  return z.object(
    Object.fromEntries(Object.entries(sections).map(([k, s]) => [k, objectSchema(s.fields)])),
  )
}

/** Fills keys missing from `value` (e.g. a field added after the document was saved). */
export function withDefaults<T>(defaults: T, value: unknown): T {
  if (Array.isArray(defaults)) return (Array.isArray(value) ? value : defaults) as T
  if (defaults && typeof defaults === 'object') {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    const out: Record<string, unknown> = {}
    for (const [key, def] of Object.entries(defaults)) {
      out[key] = withDefaults(def, (source as Record<string, unknown>)[key])
    }
    return out as T
  }
  return (value === undefined || value === null ? defaults : value) as T
}
