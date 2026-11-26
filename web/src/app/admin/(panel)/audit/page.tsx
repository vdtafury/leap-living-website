import Link from 'next/link'
import { requireActor } from '@/server/auth/current'
import { listAudit } from '@/modules/audit-logs'
import { PageHead, param, When, type SearchParams } from '../../_components/ui'

export const metadata = { title: 'Audit log' }

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireActor('audit.view')
  const rawPage = Number(param((await searchParams).page))
  const page = Number.isFinite(rawPage) ? Math.min(10_000, Math.max(1, Math.floor(rawPage))) : 1
  const { rows, total, pageSize } = await listAudit(actor, { page })
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <>
      <PageHead
        title="Audit log"
        description="Who did what, and when. Entries cannot be edited or deleted."
      />
      <div className="adm-card adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>When (Dubai)</th>
              <th>Who</th>
              <th>Action</th>
              <th>Target</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <When date={r.createdAt} />
                </td>
                <td>{r.actorName ?? 'system'}</td>
                <td>
                  <code>{r.action}</code>
                </td>
                <td className="adm-sub">
                  {r.targetType} {r.targetId}
                </td>
                <td className="adm-sub" style={{ maxWidth: 320, overflowWrap: 'anywhere' }}>
                  {r.metadata !== '{}' ? r.metadata : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="adm-actions" style={{ marginTop: '1rem' }}>
          {page > 1 && (
            <Link
              className="adm-btn adm-btn-ghost adm-btn-sm"
              href={`/admin/audit?page=${page - 1}`}
            >
              ← Newer
            </Link>
          )}
          <span className="adm-sub">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link
              className="adm-btn adm-btn-ghost adm-btn-sm"
              href={`/admin/audit?page=${page + 1}`}
            >
              Older →
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
