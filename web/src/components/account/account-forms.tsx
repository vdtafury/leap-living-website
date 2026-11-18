'use client'

import Link from 'next/link'
import {
  useActionState,
  useId,
  useState,
  useSyncExternalStore,
  useTransition,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  changePasswordAction,
  deleteAccountAction,
  forgotPasswordAction,
  resendVerificationAction,
  resetPasswordAction,
  signInAction,
  signOutAction,
  signUpAction,
  submitReviewAction,
  updateProfileAction,
  type AccountActionState,
} from '@/app/account/actions'
import { AvatarIcon, StarIcon } from '@/components/ui/icons'

type Action = (prev: AccountActionState, formData: FormData) => Promise<AccountActionState>

const noop = () => () => {}

/**
 * Account forms. Without JavaScript the <form action> posts and the server redirects. With
 * JavaScript the action is called directly: the typed values stay after an error (no React 19
 * form reset), and sign-in / sign-out end in a full page load from this closure, so the header
 * and hearts re-read the session even if Next re-renders or redirects this page meanwhile
 * (the same approach as the admin login, D-37).
 */
function useAccountForm(action: Action) {
  const [noJsState, noJsAction] = useActionState(action, null)
  const [jsState, setJsState] = useState<AccountActionState>(null)
  const [leaving, setLeaving] = useState(false)
  const [pending, startTransition] = useTransition()
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await action(null, data)
      if (result?.redirectTo) {
        setLeaving(true)
        // Team sign-in: if the admin sends the browser straight back here, the cookie was refused.
        if (result.redirectTo.startsWith('/admin')) {
          sessionStorage.setItem(TEAM_SIGNIN_CHECK_KEY, String(Date.now()))
        }
        window.location.assign(result.redirectTo)
        return
      }
      setJsState(result)
    })
  }
  return {
    state: jsState ?? noJsState,
    busy: pending || leaving,
    formProps: { action: noJsAction, onSubmit, noValidate: true },
    jsFlag: hydrated ? <input type="hidden" name="js" value="1" /> : null,
  }
}

function Notice({ state }: { state: AccountActionState }) {
  if (state?.error) {
    return (
      <div className="ll-acc-alert ll-acc-alert--error" role="alert">
        {state.error}
      </div>
    )
  }
  if (state?.ok) {
    return (
      <div className="ll-acc-alert ll-acc-alert--ok" role="status">
        {state.ok}
      </div>
    )
  }
  return null
}

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string
  name: string
  error?: string
  hint?: ReactNode
  children: (props: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode
}) {
  const id = `${useId()}-${name}`
  const describedBy = [error ? `${id}-error` : '', hint ? `${id}-hint` : '']
    .filter(Boolean)
    .join(' ')
  return (
    <div className="ll-acc-field">
      <label htmlFor={id} className="ll-field-label">
        {label}
      </label>
      {children({
        id,
        ...(error ? { 'aria-invalid': true as const } : {}),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      })}
      {hint && !error && (
        <p id={`${id}-hint`} className="ll-acc-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="ll-field-error">
          {error}
        </p>
      )}
    </div>
  )
}

/** Password input with a show / hide toggle. */
function PasswordInput({
  name,
  autoComplete,
  fieldProps,
}: {
  name: string
  autoComplete: 'current-password' | 'new-password'
  fieldProps: { id: string }
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="ll-acc-password">
      <input
        {...fieldProps}
        className="ll-input"
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        required
        maxLength={256}
        spellCheck={false}
        autoCapitalize="none"
      />
      <button
        type="button"
        className="ll-acc-reveal"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

function Submit({
  busy,
  children,
  variant = 'primary',
}: {
  busy: boolean
  children: ReactNode
  variant?: 'primary' | 'danger' | 'outline'
}) {
  return (
    <button
      type="submit"
      className={`ll-btn ${variant === 'primary' ? 'll-btn-primary' : variant === 'danger' ? 'll-acc-btn-danger' : 'll-btn-outline'} ll-acc-submit`}
      disabled={busy}
      aria-busy={busy || undefined}
    >
      {children}
    </button>
  )
}

const PASSWORD_HINT = 'At least 12 characters. A short sentence works well.'

/* ------------------------------------------------------------------ signed out */

export function SignInForm({ next, save }: { next: string; save: string }) {
  const { state, busy, formProps, jsFlag } = useAccountForm(signInAction)
  return (
    <form {...formProps} className="ll-acc-form">
      {jsFlag}
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="save" value={save} />
      <Notice state={state} />
      <Field label="Email or username" name="login">
        {(p) => (
          <input
            {...p}
            className="ll-input"
            name="login"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={254}
          />
        )}
      </Field>
      <Field
        label="Password"
        name="password"
        hint={
          <Link href="/account/forgot-password" className="ll-acc-link">
            Forgot your password?
          </Link>
        }
      >
        {(p) => <PasswordInput name="password" autoComplete="current-password" fieldProps={p} />}
      </Field>
      <Submit busy={busy}>{busy ? 'Signing in…' : 'Sign in'}</Submit>
    </form>
  )
}

export function SignUpForm({ next, save }: { next: string; save: string }) {
  const { state, busy, formProps, jsFlag } = useAccountForm(signUpAction)
  const f = state?.fields ?? {}
  return (
    <form {...formProps} className="ll-acc-form">
      {jsFlag}
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="save" value={save} />
      <div className="ll-hp" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Notice state={state} />
      <Field label="Full name" name="name" error={f.name}>
        {(p) => (
          <input
            {...p}
            className="ll-input"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
          />
        )}
      </Field>
      <Field label="Email" name="email" error={f.email}>
        {(p) => (
          <input
            {...p}
            className="ll-input"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={254}
          />
        )}
      </Field>
      <Field label="Phone (optional)" name="phone" error={f.phone}>
        {(p) => (
          <input
            {...p}
            className="ll-input"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={40}
            placeholder="+971"
          />
        )}
      </Field>
      <Field label="Password" name="password" error={f.password} hint={PASSWORD_HINT}>
        {(p) => <PasswordInput name="password" autoComplete="new-password" fieldProps={p} />}
      </Field>
      <Submit busy={busy}>{busy ? 'Creating your account…' : 'Create account'}</Submit>
    </form>
  )
}

export function ForgotPasswordForm() {
  const { state, busy, formProps, jsFlag } = useAccountForm(forgotPasswordAction)
  if (state?.ok) return <Notice state={state} />
  return (
    <form {...formProps} className="ll-acc-form">
      {jsFlag}
      <Notice state={state} />
      <Field label="Email" name="email">
        {(p) => (
          <input
            {...p}
            className="ll-input"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            required
            maxLength={254}
          />
        )}
      </Field>
      <Submit busy={busy}>{busy ? 'Sending…' : 'Send reset link'}</Submit>
    </form>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const { state, busy, formProps, jsFlag } = useAccountForm(resetPasswordAction)
  const f = state?.fields ?? {}
  return (
    <form {...formProps} className="ll-acc-form">
      {jsFlag}
      <input type="hidden" name="token" value={token} />
      <Notice state={state} />
      <Field label="New password" name="password" error={f.password} hint={PASSWORD_HINT}>
        {(p) => <PasswordInput name="password" autoComplete="new-password" fieldProps={p} />}
      </Field>
      <Field label="Repeat the new password" name="confirm" error={f.confirm}>
        {(p) => <PasswordInput name="confirm" autoComplete="new-password" fieldProps={p} />}
      </Field>
      <Submit busy={busy}>{busy ? 'Saving…' : 'Save new password'}</Submit>
    </form>
  )
}

/* ------------------------------------------------------------------ signed in */

const Csrf = ({ token }: { token: string }) => <input type="hidden" name="csrf" value={token} />

export function SignOutButton({
  csrf,
  className = 'll-btn ll-btn-outline',
}: {
  csrf: string
  className?: string
}) {
  const { busy, formProps, jsFlag } = useAccountForm(signOutAction)
  return (
    <form {...formProps} className="ll-acc-inline">
      {jsFlag}
      <Csrf token={csrf} />
      <button type="submit" className={className} disabled={busy}>
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
    </form>
  )
}

export function ResendVerificationButton({ csrf }: { csrf: string }) {
  const { state, busy, formProps, jsFlag } = useAccountForm(resendVerificationAction)
  return (
    <form {...formProps} className="ll-acc-inline">
      {jsFlag}
      <Csrf token={csrf} />
      {state && (state.ok || state.error) ? (
        <span className={state.ok ? 'll-acc-inline-ok' : 'll-acc-inline-error'} role="status">
          {state.ok ?? state.error}
        </span>
      ) : (
        <button type="submit" className="ll-acc-textbtn" disabled={busy}>
          {busy ? 'Sending…' : 'Send the link again'}
        </button>
      )}
    </form>
  )
}

export function ProfileForm({
  csrf,
  name,
  phone,
  email,
  verified,
}: {
  csrf: string
  name: string
  phone: string
  email: string
  verified: boolean
}) {
  const { state, busy, formProps, jsFlag } = useAccountForm(updateProfileAction)
  const f = state?.fields ?? {}
  return (
    <form {...formProps} className="ll-acc-form">
      {jsFlag}
      <Csrf token={csrf} />
      <Notice state={state} />
      <Field label="Email" name="email" hint={verified ? 'Confirmed' : 'Not confirmed yet'}>
        {(p) => <input {...p} className="ll-input" value={email} readOnly disabled />}
      </Field>
      <Field label="Full name" name="name" error={f.name}>
        {(p) => (
          <input
            {...p}
            className="ll-input"
            name="name"
            autoComplete="name"
            defaultValue={name}
            required
            maxLength={100}
          />
        )}
      </Field>
      <Field label="Phone (optional)" name="phone" error={f.phone}>
        {(p) => (
          <input
            {...p}
            className="ll-input"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={phone}
            maxLength={40}
            placeholder="+971"
          />
        )}
      </Field>
      <Submit busy={busy}>{busy ? 'Saving…' : 'Save details'}</Submit>
    </form>
  )
}

export function ChangePasswordForm({ csrf }: { csrf: string }) {
  const { state, busy, formProps, jsFlag } = useAccountForm(changePasswordAction)
  return (
    <form {...formProps} className="ll-acc-form" key={state?.ok ? 'done' : 'form'}>
      {jsFlag}
      <Csrf token={csrf} />
      <Notice state={state} />
      <Field label="Current password" name="current">
        {(p) => <PasswordInput name="current" autoComplete="current-password" fieldProps={p} />}
      </Field>
      <Field label="New password" name="next" hint={PASSWORD_HINT}>
        {(p) => <PasswordInput name="next" autoComplete="new-password" fieldProps={p} />}
      </Field>
      <Field label="Repeat the new password" name="confirm">
        {(p) => <PasswordInput name="confirm" autoComplete="new-password" fieldProps={p} />}
      </Field>
      <Submit busy={busy}>{busy ? 'Saving…' : 'Change password'}</Submit>
    </form>
  )
}

export function DeleteAccountForm({ csrf }: { csrf: string }) {
  const { state, busy, formProps, jsFlag } = useAccountForm(deleteAccountAction)
  return (
    <form {...formProps} className="ll-acc-form">
      {jsFlag}
      <Csrf token={csrf} />
      <Notice state={state} />
      <Field label="Your password" name="password">
        {(p) => <PasswordInput name="password" autoComplete="current-password" fieldProps={p} />}
      </Field>
      <label className="ll-acc-check">
        <input type="checkbox" name="confirm" />
        <span>I understand that my account and saved items are deleted for good.</span>
      </label>
      <Submit busy={busy} variant="danger">
        {busy ? 'Deleting…' : 'Delete my account'}
      </Submit>
    </form>
  )
}

const RATING_WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']
const REVIEW_MAX = 700

/**
 * Client review (D-44). Stars are real radio buttons (keyboard: arrow keys; works without
 * JavaScript); the picture is the generic man / woman avatar, never a photo (D-17).
 */
export function ReviewForm({
  csrf,
  shownAs,
  initial,
}: {
  csrf: string
  shownAs: string
  initial: { rating: number; title: string; body: string; role: string; avatar: string } | null
}) {
  const { state, busy, formProps, jsFlag } = useAccountForm(submitReviewAction)
  const f = state?.fields ?? {}
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [hover, setHover] = useState(0)
  const [length, setLength] = useState(initial?.body.length ?? 0)
  const shown = hover || rating
  const ratingId = useId()
  return (
    <form {...formProps} className="ll-acc-form ll-review-form">
      {jsFlag}
      <Csrf token={csrf} />
      <Notice state={state} />

      <fieldset
        className="ll-acc-field ll-review-rating"
        aria-describedby={f.rating ? `${ratingId}-error` : undefined}
      >
        <legend className="ll-field-label">Your rating</legend>
        <div className="ll-review-stars" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className={`ll-review-star${n <= shown ? ' is-on' : ''}`}
              onMouseEnter={() => setHover(n)}
            >
              <input
                type="radio"
                name="rating"
                value={n}
                defaultChecked={initial?.rating === n}
                onChange={() => setRating(n)}
                aria-label={`${n} ${n === 1 ? 'star' : 'stars'}: ${RATING_WORDS[n]}`}
              />
              <StarIcon size={30} />
            </label>
          ))}
          <span className="ll-review-rating-word" aria-hidden="true">
            {shown ? RATING_WORDS[shown] : 'Tap a star'}
          </span>
        </div>
        {f.rating && (
          <p id={`${ratingId}-error`} className="ll-field-error">
            {f.rating}
          </p>
        )}
      </fieldset>

      <Field label="Headline" name="title" error={f.title}>
        {(p) => (
          <input
            {...p}
            className="ll-input"
            name="title"
            defaultValue={initial?.title}
            required
            maxLength={80}
            placeholder="e.g. Clear advice from the first call to handover"
          />
        )}
      </Field>

      <Field
        label="Your review"
        name="body"
        error={f.body}
        hint={
          <>
            What did we do for you, and how did it go?{' '}
            <span className="tabular-nums">
              {length} / {REVIEW_MAX}
            </span>
          </>
        }
      >
        {(p) => (
          <textarea
            {...p}
            className="ll-input ll-textarea"
            name="body"
            rows={6}
            defaultValue={initial?.body}
            required
            maxLength={REVIEW_MAX}
            onChange={(e) => setLength(e.currentTarget.value.length)}
          />
        )}
      </Field>

      <Field label="About you (optional)" name="role" error={f.role} hint="Shown under your name.">
        {(p) => (
          <input
            {...p}
            className="ll-input"
            name="role"
            defaultValue={initial?.role}
            maxLength={60}
            placeholder="e.g. Bought a villa in Dubai Hills"
          />
        )}
      </Field>

      <fieldset className="ll-acc-field ll-review-avatars">
        <legend className="ll-field-label">Picture next to your review</legend>
        <div className="ll-review-avatar-row">
          {(['man', 'woman'] as const).map((variant) => (
            <label key={variant} className="ll-review-avatar-opt">
              <input
                type="radio"
                name="avatar"
                value={variant}
                defaultChecked={(initial?.avatar ?? 'man') === variant}
              />
              <span className="ll-reviews-avatar">
                <AvatarIcon variant={variant} size={48} />
              </span>
              <span>{variant === 'man' ? 'Man' : 'Woman'}</span>
            </label>
          ))}
        </div>
        {f.avatar && <p className="ll-field-error">{f.avatar}</p>}
      </fieldset>

      <p className="ll-acc-hint ll-review-shown">
        Shown as <strong>{shownAs}</strong>. Your email and phone are never published.
      </p>

      <Submit busy={busy}>
        {busy ? 'Sending…' : initial ? 'Send the new version' : 'Send review'}
      </Submit>
    </form>
  )
}

const TEAM_SIGNIN_CHECK_KEY = 'll-admin-login-check'

/**
 * Shown when a team sign-in succeeded but the admin sent the browser straight back without the
 * cookie: typically third-party cookies blocked inside another site's frame (D-37).
 */
export function CookieBlockedNotice() {
  const blocked = useSyncExternalStore(
    noop,
    () => {
      const at = Number(sessionStorage.getItem(TEAM_SIGNIN_CHECK_KEY) ?? 0)
      return at > 0 && Date.now() - at < 15_000
    },
    () => false,
  )
  // Not cleared on mount: the hydration render reads the server snapshot first. The 15 s window
  // expires it.
  if (!blocked) return null
  const framed = typeof window !== 'undefined' && window.top !== window.self
  return (
    <div className="ll-acc-alert ll-acc-alert--error" role="alert">
      Your password was accepted, but the browser did not keep the sign-in cookie, so you are still
      signed out.{' '}
      {framed ? (
        <>
          This page is open inside another site&apos;s frame, where this browser blocks cookies.{' '}
          <a href="/account/sign-in" target="_blank" rel="noopener" className="ll-acc-link">
            Open it in its own tab
          </a>{' '}
          and sign in there.
        </>
      ) : (
        <>Allow cookies for this site in the browser settings, then sign in again.</>
      )}
    </div>
  )
}
