'use client'

import { useState } from 'react'

/** Logo URL with an upload button (PNG/WebP with transparency recommended). */
export function LogoField({ csrf, initial }: { csrf: string; initial: string }) {
  const [url, setUrl] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <div className="adm-field">
      <span className="adm-label">Logo</span>
      <input type="hidden" name="logoUrl" value={url} />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            style={{ height: 28, width: 'auto', maxWidth: 120, objectFit: 'contain' }}
          />
        ) : (
          <span className="adm-sub">No logo: the name is shown as text.</span>
        )}
        <label className="adm-btn adm-btn-ghost adm-btn-sm" style={{ position: 'relative' }}>
          {busy ? 'Uploading…' : url ? 'Replace' : 'Upload'}
          <input
            type="file"
            accept="image/png,image/webp,image/jpeg"
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            disabled={busy}
            onChange={async (event) => {
              const input = event.currentTarget
              const file = input.files?.[0]
              input.value = ''
              if (!file) return
              setBusy(true)
              setError('')
              try {
                const body = new FormData()
                body.append('file', file)
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body,
                  headers: { 'x-csrf-token': csrf },
                }).catch(() => null)
                const data = response ? await response.json().catch(() => ({})) : {}
                if (response?.ok && data.ok) setUrl(data.asset.url)
                else setError(data.error ?? 'Upload failed.')
              } finally {
                setBusy(false)
              }
            }}
          />
        </label>
        {url && (
          <button
            type="button"
            className="adm-btn adm-btn-ghost adm-btn-sm"
            onClick={() => setUrl('')}
          >
            Remove
          </button>
        )}
      </div>
      {error && (
        <span className="adm-field-help" style={{ color: 'var(--adm-danger)' }}>
          {error}
        </span>
      )}
    </div>
  )
}
