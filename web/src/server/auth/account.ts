import { cookies, headers } from 'next/headers'
import { customerFromSessionToken, type CustomerActor } from '@/modules/customers'
import { cookieValue } from './api-guard'
import { csrfTokenFor, csrfValid, originAllowed } from './csrf'
import { accountCookie } from './session-token'

/**
 * Website accounts (D-40), the counterpart of ./current.ts for the public site. A separate
 * cookie, session table and CSRF scope: nothing here can authenticate an admin request.
 */

/** Route handlers: the website account from the request's cookie header, or null. */
export function customerFromRequest(request: Request): Promise<CustomerActor | null> {
  return customerFromSessionToken(cookieValue(request, accountCookie().name))
}

/** The signed-in website account for this request, or null. */
export async function getCustomer(): Promise<CustomerActor | null> {
  const jar = await cookies()
  return customerFromSessionToken(jar.get(accountCookie().name)?.value)
}

export async function setAccountCookie(token: string) {
  const { name, options } = accountCookie()
  ;(await cookies()).set(name, token, options)
}

export async function clearAccountCookie() {
  const { name, options } = accountCookie()
  ;(await cookies()).set(name, '', { ...options, maxAge: 0 })
}

export const accountCsrfToken = (customer: CustomerActor) =>
  csrfTokenFor(customer.sessionId, 'account')

export class AccountSessionError extends Error {
  constructor() {
    super('You are signed out. Sign in again.')
    this.name = 'AccountSessionError'
  }
}

export class AccountCsrfError extends Error {
  constructor() {
    super('This page has expired. Reload it and try again.')
    this.name = 'AccountCsrfError'
  }
}

/** For every account mutation: signed in, request from this site, CSRF token matches. */
export async function requireCustomerMutation(token: unknown): Promise<CustomerActor> {
  const customer = await getCustomer()
  if (!customer) throw new AccountSessionError()
  if (!originAllowed(await headers()) || !csrfValid(customer.sessionId, token, 'account')) {
    throw new AccountCsrfError()
  }
  return customer
}
