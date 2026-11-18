import Link from 'next/link'
import { notFound } from 'next/navigation'
import { csrfToken, requireActor } from '@/server/auth/current'
import { can } from '@/modules/authorization'
import { DOCUMENTS, getContentForEditing, isDocumentKey, listRevisions } from '@/modules/content'
import { contentStatusAction } from '../../../actions'
import { SubmitButton } from '../../../_components/client'
import { CsrfInput, Flash, PageHead, param, When, type SearchParams } from '../../../_components/ui'
import { ContentEditor } from './editor'

export const metadata = { title: 'Edit content' }

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>
  searchParams: SearchParams
}) {
  const { key } = await params
  if (!isDocumentKey(key)) notFound()
  const actor = await requireActor('content.view')
  const query = await searchParams
  const doc = DOCUMENTS[key]
  const [editing, revisions] = await Promise.all([
    getContentForEditing(actor, key),
    listRevisions(actor, key),
  ])
  const csrf = csrfToken(actor)
  const statusButton = (
    op: string,
    label: string,
    style = 'adm-btn-ghost',
    confirm?: string,
    extra?: Record<string, string>,
  ) => (
    <form action={contentStatusAction} className="adm-inline">
      <CsrfInput token={csrf} />
      <input type="hidden" name="key" value={key} />
      <input type="hidden" name="op" value={op} />
      {extra &&
        Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <SubmitButton className={`adm-btn ${style}`} confirm={confirm}>
        {label}
      </SubmitButton>
    </form>
  )

  return (
    <>
      <PageHead
        title={doc.title}
        description={
          editing.hasUnpublishedChanges
            ? 'The draft has changes that are not on the website yet.'
            : 'The website shows this version.'
        }
        actions={
          <>
            {doc.path && (
              <Link
                className="adm-btn adm-btn-ghost"
                href={`/admin/preview/${key}`}
                target="_blank"
                rel="noopener"
              >
                Preview draft
              </Link>
            )}
            {can(actor, 'content.edit') &&
              editing.hasUnpublishedChanges &&
              statusButton(
                'discard',
                'Discard draft',
                'adm-btn-ghost',
                'Throw away the unpublished changes?',
              )}
            {can(actor, 'content.publish') &&
              statusButton(
                'publish',
                'Publish',
                '',
                key === 'settings'
                  ? 'Publish these settings? Menu, footer and contact details change on every page.'
                  : 'Publish this page? Visitors see it immediately.',
              )}
          </>
        }
      />
      <Flash ok={param(query.ok)} error={param(query.error)} />
      <p className="adm-sub" style={{ marginTop: -6 }}>
        Save the draft first, then preview and publish. Last published:{' '}
        <When date={editing.publishedAt} />
      </p>
      <ContentEditor
        docKey={key}
        csrf={csrf}
        sections={doc.sections}
        initial={editing.draft as unknown as Record<string, unknown>}
        canEdit={can(actor, 'content.edit')}
      />
      <div className="adm-card" style={{ marginTop: '1.25rem' }}>
        <h2>Published versions</h2>
        {revisions.length === 0 ? (
          <p className="adm-sub">No versions published from the admin yet.</p>
        ) : (
          <table className="adm-table">
            <tbody>
              {revisions.map((r) => (
                <tr key={r.id}>
                  <td>
                    <When date={r.createdAt} />
                  </td>
                  <td>{r.publishedBy}</td>
                  <td style={{ textAlign: 'right' }}>
                    {can(actor, 'content.edit') &&
                      statusButton(
                        'restore',
                        'Load into draft',
                        'adm-btn-ghost adm-btn-sm',
                        undefined,
                        {
                          revisionId: r.id,
                        },
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
