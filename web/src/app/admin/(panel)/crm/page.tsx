import { csrfToken, requireActor } from '@/server/auth/current'
import { SITE_URL } from '@/lib/seo'
import { can } from '@/modules/authorization'
import { getPixxiStatus, PIXXI_MAX_ATTEMPTS } from '@/modules/pixxi-crm'
import { pixxiRetryLeadsAction, pixxiSyncAction } from '../../actions'
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

export const metadata = { title: 'Pixxi CRM' }

function leadSummary(rawPayload: string): { name: string; type: string; phone: string } {
  try {
    const parsed = JSON.parse(rawPayload) as {
      name?: string
      phone?: string
      extraData?: { inquiryType?: string }
    }
    return {
      name: parsed.name || '—',
      phone: parsed.phone || '',
      type: parsed.extraData?.inquiryType || 'LEAD',
    }
  } catch {
    return { name: '—', phone: '', type: 'LEAD' }
  }
}

export default async function PixxiCrmPage({ searchParams }: { searchParams: SearchParams }) {
  const actor = await requireActor('crm.view')
  const query = await searchParams
  const { config, counts, recentRuns, recentLeads } = await getPixxiStatus(actor)
  const csrf = csrfToken(actor)
  const canManage = can(actor, 'crm.manage')
  const webhookUrl = `${SITE_URL}/api/webhooks/pixxi`

  const retryLeadForm = (id?: string, label = 'Send queued leads') => (
    <form action={pixxiRetryLeadsAction} className="adm-inline">
      <CsrfInput token={csrf} />
      {id && <input type="hidden" name="id" value={id} />}
      <SubmitButton
        className={`adm-btn ${id ? 'adm-btn-ghost adm-btn-sm' : 'adm-btn-ghost'}`}
      >
        {label}
      </SubmitButton>
    </form>
  )

  return (
    <>
      <PageHead
        title="Pixxi CRM"
        description="Two-way sync between Pixxi CRM and the website: listings & off-plan projects flow in, and website enquiries are delivered to Pixxi Forms."
        actions={
          canManage && (
            <>
              {config.tokenConfigured && (
                <form action={pixxiSyncAction} className="adm-inline">
                  <CsrfInput token={csrf} />
                  <SubmitButton className="adm-btn">Sync from Pixxi now</SubmitButton>
                </form>
              )}
              {config.tokenConfigured &&
                config.generalFormConfigured &&
                retryLeadForm(undefined, 'Send queued leads')}
            </>
          )
        }
      />

      <Flash ok={param(query.ok)} error={param(query.error)} />

      {(!config.tokenConfigured || !config.generalFormConfigured) && (
        <div className="adm-alert adm-alert-warn">
          Pixxi CRM is waiting for credentials on the server. Add{' '}
          <code>PIXXI_API_TOKEN</code> and <code>PIXXI_FORM_GENERAL_ID</code> (plus optional{' '}
          <code>PIXXI_FORM_LISTING_ID</code> and <code>PIXXI_WEBHOOK_SECRET</code>) in cPanel
          Environment Variables, then restart the app. All website enquiries are safely stored
          locally and queued here until credentials are set.
        </div>
      )}

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-value">{counts.activeProperties}</div>
          <div className="adm-stat-label">synced properties</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-value">{counts.activeProjects}</div>
          <div className="adm-stat-label">synced projects</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-value">{counts.pendingLeads}</div>
          <div className="adm-stat-label">leads waiting</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-value">{counts.sentLeads}</div>
          <div className="adm-stat-label">leads sent</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-value">{counts.failedLeads}</div>
          <div className="adm-stat-label">leads failed</div>
        </div>
      </div>

      <div className="adm-card">
        <h2>Connection checklist</h2>
        <p className="adm-help">
          Secrets are read from server environment variables and are never shown in the dashboard.
        </p>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Setting</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>PIXXI_API_TOKEN</code>
                </td>
                <td>
                  <Badge
                    value={config.tokenConfigured ? 'ok' : 'PENDING'}
                    label={config.tokenConfigured ? 'Configured' : 'Not set'}
                  />
                </td>
                <td className="adm-sub">Endpoint: {config.baseUrl}</td>
              </tr>
              <tr>
                <td>
                  <code>PIXXI_FORM_GENERAL_ID</code>
                </td>
                <td>
                  <Badge
                    value={config.generalFormConfigured ? 'ok' : 'PENDING'}
                    label={config.generalFormConfigured ? 'Configured' : 'Not set'}
                  />
                </td>
                <td className="adm-sub">Form name: {config.generalFormName}</td>
              </tr>
              <tr>
                <td>
                  <code>PIXXI_FORM_LISTING_ID</code>
                </td>
                <td>
                  <Badge
                    value={config.listingFormConfigured ? 'ok' : 'muted'}
                    label={config.listingFormConfigured ? 'Configured' : 'Falls back to general'}
                  />
                </td>
                <td className="adm-sub">
                  Form name: {config.listingFormName} (auto-attaches Pixxi propertyId)
                </td>
              </tr>
              <tr>
                <td>
                  <code>PIXXI_WEBHOOK_SECRET</code>
                </td>
                <td>
                  <Badge
                    value={config.webhookSecretConfigured ? 'ok' : 'muted'}
                    label={config.webhookSecretConfigured ? 'Configured' : 'Optional / off'}
                  />
                </td>
                <td className="adm-sub">
                  Webhook URL: <code>{webhookUrl}</code>
                </td>
              </tr>
              <tr>
                <td>Automatic catalog sync</td>
                <td>
                  <Badge
                    value={config.tokenConfigured ? 'teal' : 'muted'}
                    label={`Every ${config.syncIntervalMinutes} min`}
                  />
                </td>
                <td className="adm-sub">
                  {config.hideStarterOnSync
                    ? 'Starter sample listings are archived automatically on first live sync.'
                    : 'Starter sample listings are kept alongside synced listings.'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="adm-card">
        <h2>Recent catalog sync runs</h2>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Started</th>
                <th>Trigger</th>
                <th>Status</th>
                <th>Changes</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.map((run) => (
                <tr key={run.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <When date={run.startedAt} />
                  </td>
                  <td>
                    <Badge value="muted" label={run.trigger.toLowerCase()} />
                  </td>
                  <td>
                    <Badge
                      value={
                        run.status === 'OK'
                          ? 'ok'
                          : run.status === 'ERROR'
                            ? 'danger'
                            : 'PENDING'
                      }
                      label={run.status.toLowerCase()}
                    />
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {run.fetched} fetched · +{run.created} / ~{run.updated} / -{run.archived}
                  </td>
                  <td>
                    {run.message || '—'}
                    {run.errors > 0 && (
                      <div className="adm-sub">{run.errors} item(s) skipped or failed</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentRuns.length === 0 && (
            <p className="adm-empty">No Pixxi catalog syncs have run yet.</p>
          )}
        </div>
      </div>

      <div className="adm-card">
        <h2>Lead delivery queue</h2>
        <p className="adm-help">
          Every website enquiry is persisted locally first, then pushed to Pixxi CRM with automatic
          retry on transient failures.
        </p>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Queued</th>
                <th>Lead</th>
                <th>Target Form</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((row) => {
                const info = leadSummary(row.payload)
                return (
                  <tr key={row.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <When date={row.createdAt} />
                    </td>
                    <td>
                      <strong>{info.name}</strong>
                      <div className="adm-sub">
                        {info.type}
                        {info.phone ? ` · ${info.phone}` : ''}
                      </div>
                      {row.lastError && (
                        <div className="adm-sub">Last error: {row.lastError}</div>
                      )}
                    </td>
                    <td>
                      {row.formName || '—'}
                      <div className="adm-sub">
                        {row.formId ? `Form ${row.formId}` : 'Awaiting form ID'}
                        {row.pixxiPropertyId ? ` · Listing ${row.pixxiPropertyId}` : ''}
                      </div>
                    </td>
                    <td>
                      <Badge value={row.status} />
                      <div className="adm-sub">
                        {row.status === 'SENT' ? (
                          <When date={row.sentAt} />
                        ) : (
                          `${row.attempts} / ${PIXXI_MAX_ATTEMPTS} attempts`
                        )}
                      </div>
                    </td>
                    <td>
                      {canManage &&
                        config.tokenConfigured &&
                        config.generalFormConfigured &&
                        row.status !== 'SENT' &&
                        retryLeadForm(row.id, 'Retry')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {recentLeads.length === 0 && (
            <p className="adm-empty">No leads have been queued for Pixxi yet.</p>
          )}
        </div>
      </div>
    </>
  )
}
