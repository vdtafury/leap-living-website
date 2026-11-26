import { csrfToken, requireActor } from '@/server/auth/current'
import { can, canAssignRole } from '@/modules/authorization'
import { listRoles, listUsers } from '@/modules/users'
import { userAction } from '../../actions'
import { SubmitButton } from '../../_components/client'
import {
  Badge,
  CsrfInput,
  Flash,
  PageHead,
  param,
  When,
  type SearchParams,
} from '../../_components/ui'
import { CreateUserForm } from './create-user-form'

export const metadata = { title: 'Users' }

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireActor('user.view')
  const query = await searchParams
  const [users, roles] = await Promise.all([listUsers(actor), listRoles(actor)])
  const csrf = csrfToken(actor)
  const manage = can(actor, 'user.manage')
  const assignable = roles.filter((r) => canAssignRole(actor, r))
  const isSuper = actor.roleKeys.includes('super_admin')

  return (
    <>
      <PageHead
        title="Users"
        description="People who can sign in to this admin. Access comes from the role."
      />
      <Flash ok={param(query.ok)} error={param(query.error)} />
      {manage && assignable.length > 0 && (
        <div className="adm-card">
          <h2>Add a user</h2>
          <p className="adm-help">
            Give the person their username and the temporary password in person or by phone; they
            choose their own password at the first sign-in.
          </p>
          <CreateUserForm
            csrf={csrf}
            roles={assignable.map((r) => ({ key: r.key, name: r.name }))}
          />
        </div>
      )}
      <div className="adm-card adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last sign-in</th>
              {manage && <th>Manage</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const targetIsSuper = u.roles.some((r) => r.key === 'super_admin')
              const canTouch = manage && u.id !== actor.id && (!targetIsSuper || isSuper)
              return (
                <tr key={u.id}>
                  <td>
                    <strong style={{ color: 'var(--adm-heading)' }}>{u.name}</strong>
                    <div className="adm-sub">
                      {u.username}
                      {u.email && ` · ${u.email}`}
                      {u.id === actor.id && ' · you'}
                    </div>
                  </td>
                  <td>{u.roles.map((r) => r.name).join(', ') || '—'}</td>
                  <td>
                    {u.isActive ? (
                      <Badge value="ok" label="active" />
                    ) : (
                      <Badge value="muted" label="deactivated" />
                    )}
                    {u.mustChangePassword && <div className="adm-sub">must change password</div>}
                    {u.lockedUntil && u.lockedUntil > new Date() && (
                      <div className="adm-sub">locked</div>
                    )}
                  </td>
                  <td>
                    <When date={u.lastLoginAt} />
                  </td>
                  {manage && (
                    <td>
                      {canTouch ? (
                        <div style={{ display: 'grid', gap: 6 }}>
                          <form action={userAction} className="adm-inline">
                            <CsrfInput token={csrf} />
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="op" value="role" />
                            <select
                              name="roleKey"
                              className="adm-select"
                              defaultValue={u.roles[0]?.key}
                              aria-label={`Role for ${u.name}`}
                              style={{ width: 'auto' }}
                            >
                              {assignable.map((r) => (
                                <option key={r.key} value={r.key}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            <SubmitButton className="adm-btn adm-btn-ghost adm-btn-sm">
                              Set role
                            </SubmitButton>
                          </form>
                          <form action={userAction} className="adm-inline">
                            <CsrfInput token={csrf} />
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="op" value="reset" />
                            <input
                              name="password"
                              className="adm-input"
                              placeholder="New temporary password"
                              aria-label={`Temporary password for ${u.name}`}
                              required
                              minLength={12}
                              maxLength={128}
                              autoComplete="new-password"
                              style={{ width: 210 }}
                            />
                            <SubmitButton className="adm-btn adm-btn-ghost adm-btn-sm">
                              Reset
                            </SubmitButton>
                          </form>
                          <form action={userAction} className="adm-inline">
                            <CsrfInput token={csrf} />
                            <input type="hidden" name="id" value={u.id} />
                            <input
                              type="hidden"
                              name="op"
                              value={u.isActive ? 'deactivate' : 'activate'}
                            />
                            <SubmitButton
                              className={`adm-btn adm-btn-sm ${u.isActive ? 'adm-btn-danger' : 'adm-btn-ghost'}`}
                              confirm={
                                u.isActive
                                  ? `Deactivate ${u.name}? They are signed out at once.`
                                  : undefined
                              }
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </SubmitButton>
                          </form>
                        </div>
                      ) : (
                        <span className="adm-sub">
                          {u.id === actor.id ? 'Your account' : 'Super Admin only'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="adm-card">
        <h2>Roles</h2>
        {roles.map((r) => (
          <div key={r.id} style={{ marginBottom: '0.8rem' }}>
            <strong style={{ color: 'var(--adm-heading)' }}>{r.name}</strong>{' '}
            <span className="adm-sub">{r.description}</span>
            <div className="adm-sub">{r.permissions.length} permissions</div>
          </div>
        ))}
      </div>
    </>
  )
}
