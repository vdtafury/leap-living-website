import Link from 'next/link'
import { notFound } from 'next/navigation'
import { csrfToken, requireActor } from '@/server/auth/current'
import { can } from '@/modules/authorization'
import {
  AVAILABILITY,
  formatMoney,
  getProjectAdmin,
  getPropertyAdmin,
  listProjectsAdmin,
  listPropertiesAdmin,
  parseJsonArray,
  type ListingImage,
} from '@/modules/listings'
import { listingStatusAction, saveProjectAction, savePropertyAction } from '../actions'
import { formValues, PROJECT_SECTIONS, PROPERTY_SECTIONS } from '../_lib/listing-fields'
import { SubmitButton } from './client'
import { ListingForm } from './listing-form'
import { Badge, CsrfInput, Flash, PageHead, param, When, type SearchParams } from './ui'

type Kind = 'property' | 'project'

const META = {
  property: {
    plural: 'Properties',
    one: 'property',
    base: '/admin/properties',
    publicBase: '/properties',
  },
  project: { plural: 'Projects', one: 'project', base: '/admin/projects', publicBase: '/projects' },
} as const

const TABS = [
  { value: '', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: 'deleted', label: 'Deleted' },
]

/** Publish / unpublish / archive / delete buttons, each its own small form. */
function StatusButtons({
  kind,
  row,
  csrf,
  back,
  perms,
  compact = false,
}: {
  kind: Kind
  row: { id: string; publicationStatus: string; deletedAt: Date | null }
  csrf: string
  back: string
  perms: { publish: boolean; remove: boolean }
  compact?: boolean
}) {
  const size = compact ? ' adm-btn-sm' : ''
  const button = (op: string, label: string, style = 'adm-btn-ghost', confirm?: string) => (
    <form action={listingStatusAction} className="adm-inline" key={op}>
      <CsrfInput token={csrf} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={row.id} />
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="back" value={back} />
      <SubmitButton className={`adm-btn ${style}${size}`} confirm={confirm}>
        {label}
      </SubmitButton>
    </form>
  )
  if (row.deletedAt) return perms.remove ? button('restore', 'Restore as draft') : null
  return (
    <>
      {perms.publish && row.publicationStatus !== 'PUBLISHED' && button('PUBLISHED', 'Publish', '')}
      {perms.publish && row.publicationStatus === 'PUBLISHED' && button('DRAFT', 'Unpublish')}
      {perms.publish &&
        row.publicationStatus !== 'ARCHIVED' &&
        !compact &&
        button('ARCHIVED', 'Archive')}
      {perms.remove &&
        !compact &&
        button(
          'delete',
          'Delete',
          'adm-btn-danger',
          `Delete this ${META[kind].one}? It disappears from the site; it can be restored from “Deleted”.`,
        )}
    </>
  )
}

export async function ListingIndex({
  kind,
  searchParams,
}: {
  kind: Kind
  searchParams: SearchParams
}) {
  const meta = META[kind]
  const actor = await requireActor(`${kind}.view`)
  const query = await searchParams
  const rawTab = param(query.status)
  const tab = TABS.some((t) => t.value === rawTab) ? rawTab : ''
  const q = param(query.q)
  const filter = {
    status: tab && tab !== 'deleted' ? tab : undefined,
    q,
    deleted: tab === 'deleted',
  }
  const rows =
    kind === 'property'
      ? await listPropertiesAdmin(actor, filter)
      : await listProjectsAdmin(actor, filter)
  const csrf = csrfToken(actor)
  const backParams = new URLSearchParams()
  if (tab) backParams.set('status', tab)
  if (q) backParams.set('q', q)
  const qs = backParams.toString()
  const back = qs ? `${meta.base}?${qs}` : meta.base
  const perms = { publish: can(actor, `${kind}.publish`), remove: can(actor, `${kind}.delete`) }

  return (
    <>
      <PageHead
        title={meta.plural}
        description={`Only published ${meta.plural.toLowerCase()} appear on the website.`}
        actions={
          can(actor, `${kind}.edit`) && (
            <Link className="adm-btn" href={`${meta.base}/new`}>
              Add {meta.one}
            </Link>
          )
        }
      />
      <Flash ok={param(query.ok)} error={param(query.error)} />
      <div className="adm-card">
        <form className="adm-filters" method="get">
          <label className="adm-field">
            <span className="adm-label">Show</span>
            <select name="status" defaultValue={tab} className="adm-select">
              {TABS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span className="adm-label">Search</span>
            <input
              name="q"
              defaultValue={q}
              className="adm-input"
              placeholder="Title, reference, community"
            />
          </label>
          <button className="adm-btn adm-btn-ghost" type="submit">
            Filter
          </button>
        </form>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th aria-label="Cover" />
                <th>Title</th>
                <th>{kind === 'property' ? 'Type' : 'Stage'}</th>
                <th>Price</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const cover = parseJsonArray<ListingImage>(row.images)[0]
                const isProperty = 'transactionType' in row
                return (
                  <tr key={row.id}>
                    <td>
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="adm-thumb" src={cover.url} alt="" />
                      ) : (
                        <span className="adm-thumb" />
                      )}
                    </td>
                    <td className="adm-title-cell">
                      <Link href={`${meta.base}/${row.id}`}>{row.title}</Link>
                      <div className="adm-sub">
                        {row.referenceNumber} · {row.community}
                        {row.featured && ' · Featured'}
                      </div>
                    </td>
                    <td>
                      {isProperty ? (
                        <>
                          {row.propertyType}
                          <div className="adm-sub">
                            {row.transactionType === 'BUY' ? 'Sale' : 'Rent'}
                          </div>
                        </>
                      ) : (
                        row.status
                      )}
                    </td>
                    <td className="tabular-nums">
                      {formatMoney(String(isProperty ? row.price : row.startingPrice))}
                    </td>
                    <td>
                      {row.deletedAt ? (
                        <Badge value="DELETED" label="deleted" />
                      ) : (
                        <Badge value={row.publicationStatus} />
                      )}
                      {isProperty && row.availabilityStatus !== 'AVAILABLE' && (
                        <div className="adm-sub">
                          {AVAILABILITY[row.availabilityStatus as keyof typeof AVAILABILITY]}
                        </div>
                      )}
                    </td>
                    <td>
                      <When date={row.updatedAt} />
                    </td>
                    <td>
                      <div className="adm-actions">
                        <StatusButtons
                          kind={kind}
                          row={row}
                          csrf={csrf}
                          back={back}
                          perms={perms}
                          compact
                        />
                        {row.publicationStatus === 'PUBLISHED' && !row.deletedAt && (
                          <a
                            className="adm-btn adm-btn-ghost adm-btn-sm"
                            href={`${meta.publicBase}/${row.slug}`}
                            target="_blank"
                            rel="noopener"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="adm-empty">Nothing here.</p>}
        </div>
      </div>
    </>
  )
}

export async function ListingEdit({
  kind,
  id,
  searchParams,
}: {
  kind: Kind
  id: string | null
  searchParams: SearchParams
}) {
  const meta = META[kind]
  const actor = await requireActor(id ? `${kind}.view` : `${kind}.edit`)
  const query = await searchParams
  const row = id
    ? kind === 'property'
      ? await getPropertyAdmin(actor, id)
      : await getProjectAdmin(actor, id)
    : null
  if (id && !row) notFound()
  const csrf = csrfToken(actor)
  const { values, images } = formValues(row as never, kind)
  const perms = { publish: can(actor, `${kind}.publish`), remove: can(actor, `${kind}.delete`) }

  return (
    <>
      <PageHead
        crumbs={<Link href={meta.base}>{meta.plural}</Link>}
        title={row ? row.title : `New ${meta.one}`}
        description={
          row
            ? row.deletedAt
              ? 'Deleted: not on the website.'
              : row.publicationStatus === 'PUBLISHED'
                ? 'Published: visible on the website. Changes go live when saved.'
                : 'Not published: hidden from the website.'
            : 'Starts as a draft; nothing appears on the site until you publish.'
        }
        actions={
          row && (
            <>
              {row.deletedAt ? (
                <Badge value="DELETED" label="deleted" />
              ) : (
                <Badge value={row.publicationStatus} />
              )}
              <StatusButtons
                kind={kind}
                row={row}
                csrf={csrf}
                back={`${meta.base}/${row.id}`}
                perms={perms}
              />
              {row.publicationStatus === 'PUBLISHED' && !row.deletedAt && (
                <a
                  className="adm-btn adm-btn-ghost"
                  href={`${meta.publicBase}/${row.slug}`}
                  target="_blank"
                  rel="noopener"
                >
                  View on site
                </a>
              )}
            </>
          )
        }
      />
      <Flash ok={param(query.ok)} error={param(query.error)} />
      <ListingForm
        action={kind === 'property' ? savePropertyAction : saveProjectAction}
        csrf={csrf}
        id={row?.id}
        sections={kind === 'property' ? PROPERTY_SECTIONS : PROJECT_SECTIONS}
        values={values}
        images={images}
        canEdit={can(actor, `${kind}.edit`) && !row?.deletedAt}
      />
    </>
  )
}
