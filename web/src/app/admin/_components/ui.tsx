import type { ReactNode } from 'react'

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  return (
    <>
      {ok && (
        <div className="adm-alert adm-alert-ok" role="status">
          {ok}
        </div>
      )}
      {error && (
        <div className="adm-alert adm-alert-error" role="alert">
          {error}
        </div>
      )}
    </>
  )
}

export function CsrfInput({ token }: { token: string }) {
  return <input type="hidden" name="csrf" value={token} />
}

export function PageHead({
  title,
  description,
  crumbs,
  actions,
}: {
  title: string
  description?: string
  crumbs?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="adm-page-head">
      <div>
        {crumbs && <div className="adm-crumbs">{crumbs}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="adm-actions">{actions}</div>}
    </div>
  )
}

export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span className={`adm-badge adm-badge-${value}`}>
      {label ?? value.toLowerCase().replace('_', ' ')}
    </span>
  )
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Dubai',
})

/** Stored in UTC, shown in Dubai time. */
export function When({ date }: { date: Date | null | undefined }) {
  if (!date) return <span className="adm-sub">—</span>
  return <time dateTime={date.toISOString()}>{dateFormat.format(date)}</time>
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>

export const param = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? ''
