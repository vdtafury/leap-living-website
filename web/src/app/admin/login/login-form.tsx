'use client'

import { loginAction } from '../actions'
import { SubmitButton, useActionForm } from '../_components/client'

export function LoginForm() {
  const { state, pending, formProps } = useActionForm(loginAction)
  return (
    <form {...formProps} className="adm-form">
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
