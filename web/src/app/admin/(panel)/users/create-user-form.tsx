'use client'

import { createUserAction } from '../../actions'
import { SubmitButton, useActionForm } from '../../_components/client'

export function CreateUserForm({
  csrf,
  roles,
}: {
  csrf: string
  roles: { key: string; name: string }[]
}) {
  const { state, pending, formProps } = useActionForm(createUserAction)
  return (
    <form {...formProps} className="adm-form">
      <input type="hidden" name="csrf" value={csrf} />
      {state?.error && (
        <div className="adm-alert adm-alert-error" role="alert">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="adm-alert adm-alert-ok" role="status">
          {state.ok}
        </div>
      )}
      <div className="adm-grid">
        <label className="adm-field">
          <span className="adm-label">Full name</span>
          <input className="adm-input" name="name" required maxLength={80} />
        </label>
        <label className="adm-field">
          <span className="adm-label">Username</span>
          <input
            className="adm-input"
            name="username"
            required
            maxLength={40}
            autoCapitalize="none"
            spellCheck={false}
          />
        </label>
        <label className="adm-field">
          <span className="adm-label">Email (optional)</span>
          <input className="adm-input" name="email" type="email" maxLength={120} />
        </label>
        <label className="adm-field">
          <span className="adm-label">Role</span>
          <select
            className="adm-select"
            name="roleKey"
            defaultValue={roles.find((r) => r.key === 'editor')?.key ?? roles[0]?.key}
          >
            {roles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          <span className="adm-label">Temporary password</span>
          <input
            className="adm-input"
            name="password"
            required
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
          />
        </label>
      </div>
      <div>
        <SubmitButton pending={pending}>Create user</SubmitButton>
      </div>
    </form>
  )
}
