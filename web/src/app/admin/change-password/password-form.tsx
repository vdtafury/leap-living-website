'use client'

import { changePasswordAction } from '../actions'
import { SubmitButton, useActionForm } from '../_components/client'

export function PasswordForm({ csrf, username }: { csrf: string; username: string }) {
  const { state, pending, formProps } = useActionForm(changePasswordAction)
  return (
    <form {...formProps} className="adm-form">
      <input type="hidden" name="csrf" value={csrf} />
      {/* Lets password managers attach the new password to the right account */}
      <input type="hidden" name="username" value={username} autoComplete="username" />
      {state?.error && (
        <div className="adm-alert adm-alert-error" role="alert">
          {state.error}
        </div>
      )}
      <label className="adm-field">
        <span className="adm-label">Current password</span>
        <input
          className="adm-input"
          name="current"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <label className="adm-field">
        <span className="adm-label">New password</span>
        <input
          className="adm-input"
          name="next"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
        />
        <span className="adm-field-help">
          At least 12 characters. A short sentence is easy to remember and hard to guess.
        </span>
      </label>
      <label className="adm-field">
        <span className="adm-label">Repeat new password</span>
        <input
          className="adm-input"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
        />
      </label>
      <SubmitButton pending={pending}>Change password</SubmitButton>
    </form>
  )
}
