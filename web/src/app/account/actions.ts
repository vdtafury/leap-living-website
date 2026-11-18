'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { originAllowed } from '@/server/auth/csrf'
import { requestInfo, setSessionCookie } from '@/server/auth/current'
import {
  AccountCsrfError,
  AccountSessionError,
  clearAccountCookie,
  requireCustomerMutation,
  setAccountCookie,
} from '@/server/auth/account'
import {
  changePassword,
  deleteAccount,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  safeNextPath,
  setFavorite,
  signIn,
  signOut,
  signUp,
  updateProfile,
  type AuthResult,
  type CustomerActor,
} from '@/modules/customers'
import { login as teamLogin } from '@/modules/users'

export type AccountActionState = {
  error?: string
  ok?: string
  fields?: Record<string, string>
  /** Full page load target after signing in or out, so the whole page shows the new state. */
  redirectTo?: string
} | null

const text = (formData: FormData, key: string) => String(formData.get(key) ?? '')
/**
 * With JavaScript the form does a full page load to `target` (header and hearts re-read the
 * new session); without JavaScript a normal server redirect.
 */
function go(target: string, formData: FormData): AccountActionState {
  if (text(formData, 'js') === '1') return { redirectTo: target }
  redirect(target)
}

const BLOCKED: AccountActionState = { error: 'Request blocked. Reload the page and try again.' }

/** Runs a signed-in mutation; session, Origin and CSRF are checked first. */
async function asCustomer(
  formData: FormData,
  fn: (customer: CustomerActor) => Promise<AccountActionState>,
): Promise<AccountActionState> {
  try {
    return await fn(await requireCustomerMutation(formData.get('csrf')))
  } catch (error) {
    if (error instanceof AccountSessionError || error instanceof AccountCsrfError) {
      return { error: error.message }
    }
    console.error('[account] action failed', error)
    return { error: 'Something went wrong. Nothing was changed.' }
  }
}

/** After a successful sign-in / sign-up / reset: cookie, the pending save, then the target. */
async function finishSignIn(result: AuthResult & { ok: true }, formData: FormData) {
  await setAccountCookie(result.token)
  // Heart clicked while signed out: save that item now (ignored if it is gone).
  const pending = text(formData, 'save')
  if (pending) await setFavorite(result.customerId, pending, true).catch(() => undefined)
  return go(safeNextPath(text(formData, 'next')), formData)
}

/* ------------------------------------------------------------------ signed out */

export async function signInAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  // No session yet, so no CSRF token: the same-site check stops cross-site posts.
  if (!originAllowed(await headers())) return BLOCKED
  // One sign-in page for everyone (D-41). Team usernames never contain "@" (letters, digits,
  // dots, dashes, underscores), so the shape of what was typed picks the account type; the
  // answer never depends on whether an account exists.
  const login = text(formData, 'login').trim()
  const password = text(formData, 'password')
  if (!login.includes('@')) return teamSignIn(login, password, formData)
  const result = await signIn({ email: login, password }, await requestInfo())
  if (!result.ok) return { error: result.error }
  return finishSignIn(result, formData)
}

/** A Leap Living team member: admin session (the D-31 rules), then the admin. */
async function teamSignIn(
  username: string,
  password: string,
  formData: FormData,
): Promise<AccountActionState> {
  const result = await teamLogin({ username, password }, await requestInfo())
  if (!result.ok) {
    return {
      error:
        result.reason === 'locked'
          ? 'Too many attempts. Try again in 15 minutes.'
          : 'Wrong username or password.',
    }
  }
  await setSessionCookie(result.token)
  // A full page load to the admin shows whether the browser kept the cookie (D-37).
  return go(result.mustChangePassword ? '/admin/change-password' : '/admin', formData)
}

export async function signUpAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  if (!originAllowed(await headers())) return BLOCKED
  // Honeypot: hidden from people, so only bots fill it.
  if (text(formData, 'website')) return { error: 'Could not create the account.' }
  const result = await signUp(
    {
      name: text(formData, 'name'),
      email: text(formData, 'email'),
      phone: text(formData, 'phone'),
      password: text(formData, 'password'),
    },
    await requestInfo(),
  )
  if (!result.ok) return { error: result.error, fields: result.fields }
  return finishSignIn(result, formData)
}

export async function forgotPasswordAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  if (!originAllowed(await headers())) return BLOCKED
  await requestPasswordReset(text(formData, 'email'), await requestInfo())
  // Same answer for every address (no account discovery).
  return {
    ok: 'If an account exists for this email, a reset link is on its way. Check your inbox (and spam folder); the link expires in 1 hour.',
  }
}

export async function resetPasswordAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  if (!originAllowed(await headers())) return BLOCKED
  if (text(formData, 'password') !== text(formData, 'confirm')) {
    return { error: 'The two passwords do not match.', fields: { confirm: 'Does not match.' } }
  }
  const result = await resetPassword(
    text(formData, 'token'),
    text(formData, 'password'),
    await requestInfo(),
  )
  if (!result.ok) return { error: result.error, fields: result.fields }
  formData.set('next', '/account?reset=1')
  return finishSignIn(result, formData)
}

/* ------------------------------------------------------------------ signed in */

export async function signOutAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  await asCustomer(formData, async (customer) => {
    await signOut(customer, (await requestInfo()).ipHash)
    return null
  })
  // Signed out already (or an expired page): clear the cookie and go home all the same.
  await clearAccountCookie()
  return go('/', formData)
}

export async function updateProfileAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  return asCustomer(formData, async (customer) => {
    const result = await updateProfile(customer, {
      name: text(formData, 'name'),
      phone: text(formData, 'phone'),
    })
    return result.ok
      ? { ok: 'Your details are saved.' }
      : { error: result.error, fields: result.fields }
  })
}

export async function changePasswordAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  return asCustomer(formData, async (customer) => {
    if (text(formData, 'next') !== text(formData, 'confirm')) {
      return { error: 'The two new passwords do not match.' }
    }
    const result = await changePassword(
      customer,
      { current: text(formData, 'current'), next: text(formData, 'next') },
      await requestInfo(),
    )
    if (!result.ok) return { error: result.error }
    await setAccountCookie(result.token)
    return { ok: 'Password changed. Other devices were signed out.' }
  })
}

export async function resendVerificationAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  return asCustomer(formData, async (customer) => {
    const result = await resendVerification(customer)
    return result.ok ? { ok: `We sent a new link to ${customer.email}.` } : { error: result.error }
  })
}

export async function deleteAccountAction(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  if (text(formData, 'confirm') !== 'on') {
    return { error: 'Tick the box to confirm that you want to delete the account.' }
  }
  const result = await asCustomer(formData, async (customer) => {
    const deleted = await deleteAccount(customer, text(formData, 'password'), await requestInfo())
    return deleted.ok ? { ok: 'deleted' } : { error: deleted.error }
  })
  if (result?.ok !== 'deleted') return result
  await clearAccountCookie()
  return go('/account/sign-in?deleted=1', formData)
}

/**
 * Heart buttons (called directly from the client, not a form). Returns the stored state, or
 * `signedOut` so the button can send the visitor to the sign-in page.
 */
export async function toggleFavoriteAction(
  csrf: string,
  key: string,
  saved: boolean,
): Promise<{ ok: true; saved: boolean } | { ok: false; error: string; signedOut?: boolean }> {
  try {
    const customer = await requireCustomerMutation(csrf)
    return await setFavorite(customer.id, key, saved === true)
  } catch (error) {
    if (error instanceof AccountSessionError) {
      return { ok: false, error: error.message, signedOut: true }
    }
    if (error instanceof AccountCsrfError) return { ok: false, error: error.message }
    console.error('[account] save failed', error)
    return { ok: false, error: 'Could not save right now.' }
  }
}
