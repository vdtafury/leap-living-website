'use client'

import {
  useActionState,
  useState,
  useSyncExternalStore,
  useTransition,
  type FormEvent,
} from 'react'
import { loginAction } from '../actions'
import type { ActionState } from '../_lib/guard'
import { SubmitButton } from '../_components/client'

export function LoginForm() {
  // `action` stays for sign-in without JavaScript (server redirect). With JavaScript the action
  // is called directly so the full page load below runs even if Next re-renders this page.
  const [noJsState, noJsAction] = useActionState(loginAction, null)
  const [jsState, setJsState] = useState<ActionState>(null)
  const [pending, startTransition] = useTransition()
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
  const state = jsState ?? noJsState

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await loginAction(null, data)
      if (result?.redirectTo) {
        // A full load proves the cookie was stored; if it comes back here, it was blocked.
        sessionStorage.setItem(LOGIN_CHECK_KEY, String(Date.now()))
        window.location.assign(result.redirectTo)
        return
      }
      setJsState(result)
    })
  }

  return (
    <form action={noJsAction} onSubmit={onSubmit} className="adm-form">
      {hydrated && <input type="hidden" name="js" value="1" />}
      {state?.error && (
        <div className="adm-alert adm-alert-error" role="alert">
          {state.error}
        </div>
      )}
      <label className="adm-field">
        <span className="adm-label">Username</span>
        <input
          className="adm-input"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={100}
        />
      </label>
      <label className="adm-field">
        <span className="adm-label">Password</span>
        <input
          className="adm-input"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
        />
      </label>
      <SubmitButton pending={pending}>Sign in</SubmitButton>
    </form>
  )
}

const noop = () => () => {}
export const LOGIN_CHECK_KEY = 'll-admin-login-check'

/**
 * Shown when a sign-in succeeded but the browser came straight back without the cookie:
 * typically third-party cookies blocked because the admin is open inside another site's frame.
 */
export function CookieBlockedNotice() {
  const blocked = useSyncExternalStore(
    noop,
    () => {
      const at = Number(sessionStorage.getItem(LOGIN_CHECK_KEY) ?? 0)
      return at > 0 && Date.now() - at < 15_000
    },
    () => false,
  )
  // Not cleared on mount: the hydration render reads the server snapshot first, and clearing
  // here would hide the notice before the client render. The 15 s window expires it.
  if (!blocked) return null
  const framed = typeof window !== 'undefined' && window.top !== window.self
  return (
    <div className="adm-alert adm-alert-error" role="alert">
      Your password was accepted, but the browser did not keep the sign-in cookie, so you are still
      signed out.{' '}
      {framed ? (
        <>
          The admin is open inside another site&apos;s frame, where this browser blocks cookies.{' '}
          <a href="/admin/login" target="_blank" rel="noopener">
            Open the admin in its own tab
          </a>{' '}
          and sign in there.
        </>
      ) : (
        <>Allow cookies for this site in the browser settings, then sign in again.</>
      )}
    </div>
  )
}
