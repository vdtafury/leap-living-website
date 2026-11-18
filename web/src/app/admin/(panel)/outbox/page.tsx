import { csrfToken, requireActor } from '@/server/auth/current'
import { can } from '@/modules/authorization'
import { listOutbox, MAX_ATTEMPTS } from '@/modules/inquiries'
import { outboxRetryAction } from '../../actions'
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

export const metadata = { title: 'Email queue' }

export default async function OutboxPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireActor('email.view')
  const query = await searchParams
  const { rows, counts, smtpConfigured } = await listOutbox(actor)
  const csrf = csrfToken(actor)
  const retry = (id?: string, label = 'Send now') => (
    <form action={outboxRetryAction} className="adm-inline">
      <CsrfInput token={csrf} />
      {id && <input type="hidden" name="id" value={id} />}
      <SubmitButton className={`adm-btn ${id ? 'adm-btn-ghost adm-btn-sm' : ''}`}>
        {label}
      </SubmitButton>
    </form>
  )
  return (
    <>
      <PageHead
        title="Email queue"
        description="Notification emails for form requests. The request is always saved first; the email follows."
        actions={
          can(actor, 'email.retry') &&
          smtpConfigured &&
          retry(undefined, 'Send waiting & failed now')
        }
      />
      <Flash ok={param(query.ok)} error={param(query.error)} />
      {!smtpConfigured && (
        <div className="adm-alert adm-alert-warn">
          Email sending is not set up yet: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
          MAIL_FROM and MAIL_TO on the server (see .env.example). Until then emails wait here and
          nothing is lost.
        </div>
      )}
      <div className="adm-stats">
        {(['PENDING', 'SENT', 'FAILED'] as const).map((s) => (
          <div className="adm-stat" key={s}>
            <div className="adm-stat-value">{counts[s] ?? 0}</div>
            <div className="adm-stat-label">{s.toLowerCase()}</div>
          </div>
        ))}
      </div>
      <div className="adm-card adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Queued</th>
              <th>Subject</th>
              <th>To</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <When date={r.createdAt} />
                </td>
                <td>
                  {r.subject}
                  {r.lastError && <div className="adm-sub">Last error: {r.lastError}</div>}
                </td>
                <td>{r.to}</td>
                <td>
                  <Badge value={r.status} />
                  <div className="adm-sub">
                    {r.status === 'SENT' ? (
                      <When date={r.sentAt} />
                    ) : (
                      `${r.attempts} / ${MAX_ATTEMPTS} attempts`
                    )}
                  </div>
                </td>
                <td>
                  {can(actor, 'email.retry') &&
                    smtpConfigured &&
                    r.status !== 'SENT' &&
                    retry(r.id, 'Retry')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="adm-empty">The queue is empty.</p>}
      </div>
    </>
  )
}
