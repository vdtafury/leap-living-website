import { CsrfError, requireMutation } from '@/server/auth/current'
import { ForbiddenError } from '@/modules/authorization'
import type { SessionActor } from '@/modules/users'

export type ActionState = { error?: string; ok?: string } | null

/**
 * Runs an admin mutation: session + Origin + CSRF first (requireMutation), then `fn`, which
 * calls the module (the module checks the permission again, next to the data). Known failures
 * become a message; anything else is logged and shown generically.
 */
export async function guarded<T>(
  formData: FormData,
  fn: (actor: SessionActor) => Promise<T>,
  options: { allowPasswordChange?: boolean } = {},
): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  try {
    const actor = await requireMutation(formData.get('csrf'), options)
    return { ok: true, value: await fn(actor) }
  } catch (error) {
    if (error instanceof CsrfError) return { ok: false, error: error.message }
    if (error instanceof ForbiddenError) {
      return { ok: false, error: 'You do not have permission to do this.' }
    }
    console.error('[admin] action failed', error)
    return { ok: false, error: 'Something went wrong. Nothing was changed.' }
  }
}

export const text = (formData: FormData, key: string) => String(formData.get(key) ?? '')

export function jsonField<T>(formData: FormData, key: string, fallback: T): T {
  try {
    return JSON.parse(text(formData, key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

/** Safe in-app return path for redirects after an action. */
export function backTo(formData: FormData, fallback: string): string {
  const value = text(formData, 'back')
  return /^\/admin(\/[\w\-/?=&%.]*)?$/.test(value) ? value : fallback
}

export const withMessage = (path: string, key: 'ok' | 'error', message: string) =>
  `${path}${path.includes('?') ? '&' : '?'}${key}=${encodeURIComponent(message)}`
