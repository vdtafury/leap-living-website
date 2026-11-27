import Link from 'next/link'
import { csrfToken, requireActor } from '@/server/auth/current'
import { can } from '@/modules/authorization'
import { INQUIRY_STATUSES, listInquiries } from '@/modules/inquiries'
import { INQUIRY_TYPES } from '@/lib/inquiry'
import { inquiryStatusAction } from '../../actions'
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

export const metadata = { title: 'Form requests' }

const TYPE_LABEL: Record<string, string> = {
  CONSULTATION: 'Consultation',
  VALUATION: 'Valuation',
  LIST_PROPERTY: 'List with us',
  PROPERTY_INQUIRY: 'Viewing',
  PROJECT_BRIEFING: 'Project briefing',
}

export default async function InquiriesPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireActor('inquiry.view')
  const query = await searchParams
  const rawStatus = param(query.status)
  const rawType = param(query.type)
  const status = (INQUIRY_STATUSES as readonly string[]).includes(rawStatus) ? rawStatus : ''
  const type = (INQUIRY_TYPES as readonly string[]).includes(rawType) ? rawType : ''
  const rawPage = Number(param(query.page))
  const page = Number.isFinite(rawPage) ? Math.min(10_000, Math.max(1, Math.floor(rawPage))) : 1
  const { rows, total, pageSize } = await listInquiries(actor, {
    status: status || undefined,
    type: type || undefined,
    page,
  })
  const csrf = csrfToken(actor)
  const pageHref = (p: number) => {
    const qs = new URLSearchParams()
    if (status) qs.set('status', status)
    if (type) qs.set('type', type)
    qs.set('page', String(p))
    return `/admin/inquiries?${qs.toString()}`
  }
  const back = pageHref(page)
  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <>
      <PageHead
        title="Form requests"
        description="Every consultation, valuation, viewing and project request from the website. Personal data: handle with care."
        actions={
          can(actor, 'inquiry.export') && (
            <a className="adm-btn adm-btn-ghost" href="/api/inquiries?format=csv">
              Download CSV
            </a>
          )
        }
      />
      <Flash ok={param(query.ok)} error={param(query.error)} />
      <div className="adm-card">
        <form className="adm-filters" method="get">
          <label className="adm-field">
            <span className="adm-label">Status</span>
            <select className="adm-select" name="status" defaultValue={status}>
              <option value="">All</option>
              {INQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span className="adm-label">Type</span>
            <select className="adm-select" name="type" defaultValue={type}>
              <option value="">All</option>
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </label>
          <button className="adm-btn adm-btn-ghost" type="submit">
            Filter
          </button>
        </form>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Contact</th>
                <th>Request</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <When date={r.createdAt} />
                    <div className="adm-sub">{TYPE_LABEL[r.type] ?? r.type}</div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--adm-heading)' }}>{r.name}</strong>
                    <div>
                      <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>{r.phone}</a>
                    </div>
                    {r.email && (
                      <div>
                        <a href={`mailto:${r.email}`}>{r.email}</a>
                      </div>
                    )}
                  </td>
                  <td style={{ maxWidth: 420 }}>
                    <div>{r.interest}</div>
                    {r.context && <div className="adm-sub">About: {r.context}</div>}
                    {r.notes && <div className="adm-pre">{r.notes}</div>}
                  </td>
                  <td>
                    <Badge value={r.status} />
                    {can(actor, 'inquiry.update') && (
                      <form
                        action={inquiryStatusAction}
                        className="adm-inline"
                        style={{ marginTop: 6 }}
                      >
                        <CsrfInput token={csrf} />
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="back" value={back} />
                        <select
                          name="status"
                          className="adm-select"
                          defaultValue={r.status}
                          aria-label="New status"
                          style={{ width: 'auto' }}
                        >
                          {INQUIRY_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.toLowerCase()}
                            </option>
                          ))}
                        </select>
                        <SubmitButton className="adm-btn adm-btn-ghost adm-btn-sm">
                          Set
                        </SubmitButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="adm-empty">No requests.</p>}
        </div>
        {pages > 1 && (
          <div className="adm-actions" style={{ marginTop: '1rem' }}>
            {page > 1 && (
              <Link className="adm-btn adm-btn-ghost adm-btn-sm" href={pageHref(page - 1)}>
                ← Newer
              </Link>
            )}
            <span className="adm-sub">
              Page {page} of {pages} · {total} requests
            </span>
            {page < pages && (
              <Link className="adm-btn adm-btn-ghost adm-btn-sm" href={pageHref(page + 1)}>
                Older →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
