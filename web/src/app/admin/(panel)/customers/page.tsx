import Link from 'next/link'
import { csrfToken, requireActor } from '@/server/auth/current'
import { can } from '@/modules/authorization'
import { listCustomers } from '@/modules/customers'
import { customerAction } from '../../actions'
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

export const metadata = { title: 'Website accounts' }

export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireActor('customer.view')
  const query = await searchParams
  const q = param(query.q).slice(0, 80)
  const { rows, total, page, pageSize } = await listCustomers(actor, {
    q,
    page: Number(param(query.page)) || 1,
  })
  const csrf = csrfToken(actor)
  const manage = can(actor, 'customer.manage')
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const link = (p: number) => `/admin/customers?q=${encodeURIComponent(q)}&page=${p}`
  const back = link(page)

  return (
    <>
      <PageHead
        title="Website accounts"
        description="Visitors who created an account on the website to save listings and follow their requests. Personal data: handle with care."
      />
      <Flash ok={param(query.ok)} error={param(query.error)} />
      <div className="adm-card">
        <form className="adm-filters" method="get">
          <label className="adm-field" style={{ flex: 1 }}>
            <span className="adm-label">Search</span>
            <input
              className="adm-input"
              name="q"
              defaultValue={q}
              placeholder="Name, email or phone"
              maxLength={80}
            />
          </label>
          <button className="adm-btn adm-btn-ghost" type="submit">
            Search
          </button>
        </form>
      </div>
      <div className="adm-card adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Email</th>
              <th>Saved</th>
              <th>Requests</th>
              <th>Joined</th>
              <th>Last sign-in</th>
              <th>Status</th>
              {manage && <th>Manage</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong style={{ color: 'var(--adm-heading)' }}>{c.name}</strong>
                  <div className="adm-sub">
                    {c.email}
                    {c.phone && ` · ${c.phone}`}
                  </div>
                </td>
                <td>
                  {c.emailVerifiedAt ? (
                    <Badge value="ok" label="confirmed" />
                  ) : (
                    <Badge value="muted" label="not confirmed" />
                  )}
                </td>
                <td className="tabular-nums">{c.savedCount}</td>
                <td className="tabular-nums">{c.requestCount}</td>
                <td>
                  <When date={c.createdAt} />
                </td>
                <td>
                  <When date={c.lastLoginAt} />
                </td>
                <td>
                  {c.isActive ? (
                    <Badge value="ok" label="active" />
                  ) : (
                    <Badge value="muted" label="deactivated" />
                  )}
                  {c.lockedUntil && c.lockedUntil > new Date() && (
                    <div className="adm-sub">locked (wrong passwords)</div>
                  )}
                </td>
                {manage && (
                  <td>
                    <form action={customerAction} className="adm-inline">
                      <CsrfInput token={csrf} />
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="back" value={back} />
                      <input
                        type="hidden"
                        name="op"
                        value={c.isActive ? 'deactivate' : 'activate'}
                      />
                      <SubmitButton
                        className="adm-btn adm-btn-ghost adm-btn-sm"
                        confirm={
                          c.isActive
                            ? `Deactivate ${c.email}? They are signed out and cannot sign in.`
                            : undefined
                        }
                      >
                        {c.isActive ? 'Deactivate' : 'Reactivate'}
                      </SubmitButton>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="adm-empty">{q ? 'No account matches.' : 'No website accounts yet.'}</p>
        )}
        {pages > 1 && (
          <div className="adm-actions" style={{ marginTop: '1rem' }}>
            {page > 1 && (
              <Link className="adm-btn adm-btn-ghost adm-btn-sm" href={link(page - 1)}>
                ← Newer
              </Link>
            )}
            <span className="adm-sub">
              Page {page} of {pages} · {total} accounts
            </span>
            {page < pages && (
              <Link className="adm-btn adm-btn-ghost adm-btn-sm" href={link(page + 1)}>
                Older →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
