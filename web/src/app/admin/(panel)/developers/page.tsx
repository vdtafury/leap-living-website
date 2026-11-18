import { csrfToken, requireActor } from '@/server/auth/current'
import { listDevelopersAdmin } from '@/modules/developers'
import { developerAction } from '../../actions'
import { SubmitButton } from '../../_components/client'
import { CsrfInput, Flash, PageHead, param, type SearchParams } from '../../_components/ui'
import { LogoField } from './logo-field'

export const metadata = { title: 'Developers' }

export default async function DevelopersPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireActor('developer.manage')
  const query = await searchParams
  const developers = await listDevelopersAdmin(actor)
  const csrf = csrfToken(actor)

  const fields = (d?: (typeof developers)[number]) => (
    <>
      <CsrfInput token={csrf} />
      {d && <input type="hidden" name="id" value={d.id} />}
      <input type="hidden" name="sortOrder" value={d?.sortOrder ?? (developers.length + 1) * 10} />
      <div className="adm-grid">
        <label className="adm-field">
          <span className="adm-label">Name</span>
          <input className="adm-input" name="name" defaultValue={d?.name} required maxLength={60} />
        </label>
        <LogoField csrf={csrf} initial={d?.logoUrl ?? ''} />
        <label className="adm-field">
          <span className="adm-label">Width (px)</span>
          <input
            className="adm-input"
            name="logoWidth"
            type="number"
            min={16}
            max={240}
            defaultValue={d?.logoWidth ?? 120}
          />
        </label>
        <label className="adm-field">
          <span className="adm-label">Height (px)</span>
          <input
            className="adm-input"
            name="logoHeight"
            type="number"
            min={12}
            max={80}
            defaultValue={d?.logoHeight ?? 32}
          />
        </label>
        <label className="adm-check">
          <input type="checkbox" name="isVisible" defaultChecked={d?.isVisible ?? true} />
          <span>Shown in the logo strip</span>
        </label>
      </div>
    </>
  )

  return (
    <>
      <PageHead
        title="Developers"
        description="The logo strip on the homepage and About page, in this order. Width and height are the display size; balance them so every logo looks equally heavy."
      />
      <Flash ok={param(query.ok)} error={param(query.error)} />
      <div className="adm-card">
        <h2>Add a developer</h2>
        <form action={developerAction} className="adm-form">
          {fields()}
          <div>
            <SubmitButton>Add</SubmitButton>
          </div>
        </form>
      </div>
      {developers.map((d, index) => (
        <div className="adm-card" key={d.id}>
          <div className="adm-card-head">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span className="adm-sub">{index + 1}.</span>
              {d.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.logoUrl}
                  alt=""
                  width={d.logoWidth}
                  height={d.logoHeight}
                  style={{ objectFit: 'contain' }}
                />
              ) : null}
              <span>{d.name}</span>
              {!d.isVisible && <span className="adm-badge adm-badge-muted">hidden</span>}
            </h2>
            <div className="adm-actions">
              {(['up', 'down'] as const).map((op) => (
                <form action={developerAction} className="adm-inline" key={op}>
                  <CsrfInput token={csrf} />
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="op" value={op} />
                  <SubmitButton className="adm-btn adm-btn-ghost adm-btn-sm">
                    {op === 'up' ? '↑ Earlier' : '↓ Later'}
                  </SubmitButton>
                </form>
              ))}
              <form action={developerAction} className="adm-inline">
                <CsrfInput token={csrf} />
                <input type="hidden" name="id" value={d.id} />
                <input type="hidden" name="op" value="delete" />
                <SubmitButton
                  className="adm-btn adm-btn-danger adm-btn-sm"
                  confirm={`Remove ${d.name}?`}
                >
                  Delete
                </SubmitButton>
              </form>
            </div>
          </div>
          <details>
            <summary style={{ cursor: 'pointer', color: 'var(--adm-teal)' }}>Edit</summary>
            <form action={developerAction} className="adm-form" style={{ marginTop: '0.8rem' }}>
              {fields(d)}
              <div>
                <SubmitButton>Save</SubmitButton>
              </div>
            </form>
          </details>
        </div>
      ))}
    </>
  )
}
