import Link from 'next/link'
import { requireActor } from '@/server/auth/current'
import { can } from '@/modules/authorization'
import { dashboardSummary } from '@/modules/reporting'
import { smtpConfigured } from '@/modules/inquiries'
import { countPendingReviews } from '@/modules/reviews'
import { Flash, PageHead, param, When, type SearchParams } from '../_components/ui'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireActor()
  const query = await searchParams
  if (!can(actor, 'dashboard.view')) {
    return <PageHead title={`Welcome, ${actor.name}`} description="Your role has no dashboard." />
  }
  const [s, pendingReviews] = await Promise.all([
    dashboardSummary(actor),
    can(actor, 'review.view') ? countPendingReviews(actor) : Promise.resolve(null),
  ])
  const total = (counts: Record<string, number> | null) =>
    counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0

  return (
    <>
      <PageHead title={`Welcome, ${actor.name}`} description="What is on the website right now." />
      <Flash
        ok={param(query.ok)}
        error={param(query.denied) ? 'You do not have access to that page.' : param(query.error)}
      />

      {s.outbox && !smtpConfigured() && s.outbox.pending > 0 && (
        <div className="adm-alert adm-alert-warn">
          {s.outbox.pending} notification email(s) are waiting: email sending is not set up yet
          (SMTP). Every request is saved and listed under{' '}
          <Link href="/admin/inquiries">Form requests</Link>.
        </div>
      )}

      <div className="adm-stats">
        {s.properties && (
          <Link className="adm-stat" href="/admin/properties">
            <div className="adm-stat-value">{s.properties.PUBLISHED ?? 0}</div>
            <div className="adm-stat-label">
              Published properties · {total(s.properties)} in total, {s.properties.DRAFT ?? 0} draft
            </div>
          </Link>
        )}
        {s.projects && (
          <Link className="adm-stat" href="/admin/projects">
            <div className="adm-stat-value">{s.projects.PUBLISHED ?? 0}</div>
            <div className="adm-stat-label">
              Published projects · {total(s.projects)} in total, {s.projects.DRAFT ?? 0} draft
            </div>
          </Link>
        )}
        {s.inquiries && (
          <Link className="adm-stat" href="/admin/inquiries?status=NEW">
            <div className="adm-stat-value">{s.inquiries.new}</div>
            <div className="adm-stat-label">
              New form requests · {s.inquiries.week} in the last 7 days
            </div>
          </Link>
        )}
        {pendingReviews !== null && (
          <Link className="adm-stat" href="/admin/reviews">
            <div className="adm-stat-value">{pendingReviews}</div>
            <div className="adm-stat-label">Client reviews waiting for approval</div>
          </Link>
        )}
        {s.outbox && (
          <Link className="adm-stat" href="/admin/outbox">
            <div className="adm-stat-value">{s.outbox.pending}</div>
            <div className="adm-stat-label">Emails waiting · {s.outbox.failed} failed</div>
          </Link>
        )}
      </div>

      <div className="adm-card">
        <h2>Quick actions</h2>
        <div className="adm-actions">
          {can(actor, 'property.edit') && (
            <Link className="adm-btn" href="/admin/properties/new">
              Add a property
            </Link>
          )}
          {can(actor, 'project.edit') && (
            <Link className="adm-btn adm-btn-ghost" href="/admin/projects/new">
              Add a project
            </Link>
          )}
          {can(actor, 'content.edit') && (
            <Link className="adm-btn adm-btn-ghost" href="/admin/content/home">
              Edit the homepage
            </Link>
          )}
        </div>
      </div>

      {s.recent && (
        <div className="adm-card">
          <div className="adm-card-head">
            <h2>Recent activity</h2>
            <Link href="/admin/audit">Full audit log</Link>
          </div>
          <table className="adm-table">
            <tbody>
              {s.recent.map((row) => (
                <tr key={row.id}>
                  <td style={{ width: 190 }}>
                    <When date={row.createdAt} />
                  </td>
                  <td>{row.actorName ?? 'system'}</td>
                  <td>
                    <code>{row.action}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
