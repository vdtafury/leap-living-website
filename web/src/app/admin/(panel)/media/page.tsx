import { csrfToken, requireActor } from '@/server/auth/current'
import { can } from '@/modules/authorization'
import { listMedia } from '@/modules/media'
import { deleteMediaAction } from '../../actions'
import { SubmitButton } from '../../_components/client'
import { CsrfInput, Flash, PageHead, param, When, type SearchParams } from '../../_components/ui'

export const metadata = { title: 'Images' }

export default async function MediaPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireActor('media.view')
  const query = await searchParams
  const assets = await listMedia(actor)
  const csrf = csrfToken(actor)
  return (
    <>
      <PageHead
        title="Images"
        description="Uploaded images. Add images from a property or project page; an image still in use cannot be deleted."
      />
      <Flash ok={param(query.ok)} error={param(query.error)} />
      <div className="adm-card">
        {assets.length === 0 ? (
          <p className="adm-empty">No uploads yet.</p>
        ) : (
          <div className="adm-images">
            {assets.map((a) => (
              <div className="adm-image" key={a.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt="" loading="lazy" />
                <div className="adm-image-body">
                  <span className="adm-sub" style={{ overflowWrap: 'anywhere' }}>
                    {a.originalName}
                  </span>
                  <span className="adm-sub">
                    {a.width}×{a.height} · {Math.round(a.size / 1024)} KB ·{' '}
                    <When date={a.createdAt} />
                  </span>
                  {can(actor, 'media.delete') && (
                    <form action={deleteMediaAction}>
                      <CsrfInput token={csrf} />
                      <input type="hidden" name="id" value={a.id} />
                      <SubmitButton
                        className="adm-btn adm-btn-danger adm-btn-sm"
                        confirm="Delete this image?"
                      >
                        Delete
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
