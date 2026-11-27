'use client'

import { createContext, useContext, useState } from 'react'
import type { Field, Fields, SectionDef } from '@/modules/content'
import { saveContentAction } from '../../../actions'
import { SubmitButton, useActionForm } from '../../../_components/client'

type Value = unknown
type Obj = Record<string, Value>

const isFieldMap = (item: Fields | Field): item is Fields =>
  typeof (item as Field).kind !== 'string'

function emptyFor(item: Fields | Field): Value {
  if (!isFieldMap(item))
    return item.kind === 'number' ? item.min : item.kind === 'boolean' ? false : ''
  return Object.fromEntries(
    Object.entries(item).map(([key, field]) => [
      key,
      field.kind === 'group'
        ? emptyFor(field.fields)
        : field.kind === 'list'
          ? []
          : field.kind === 'select'
            ? field.options[0].value
            : emptyFor(field),
    ]),
  )
}

/** The CSRF token for image uploads made from inside the editor. */
const CsrfContext = createContext('')

/** Image picker: the same upload endpoint as listings (resized to WebP, saved in Media). */
function ImageField({
  field,
  value,
  onChange,
  id,
}: {
  field: Extract<Field, { kind: 'image' }>
  value: string
  onChange: (value: string) => void
  id: string
}) {
  const csrf = useContext(CsrfContext)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return (
    <div className="adm-field">
      <span className="adm-label" id={`${id}-label`}>
        {field.label}
      </span>
      <div className="adm-image-pick">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="adm-image-pick-preview" />
        ) : (
          <span className="adm-image-pick-preview adm-image-pick-empty" aria-hidden="true">
            No photo
          </span>
        )}
        <span className="adm-image-tools">
          <label className="adm-btn adm-btn-ghost adm-btn-sm" style={{ position: 'relative' }}>
            {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-labelledby={`${id}-label`}
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
                  if (response?.ok && data.ok) onChange(data.asset.url)
                  else setError(data.error ?? 'Upload failed.')
                } finally {
                  setBusy(false)
                }
              }}
            />
          </label>
          {value && field.optional && (
            <button
              type="button"
              className="adm-btn adm-btn-ghost adm-btn-sm"
              onClick={() => onChange('')}
            >
              Remove
            </button>
          )}
        </span>
      </div>
      {error ? (
        <span className="adm-field-help" role="alert" style={{ color: 'var(--adm-danger)' }}>
          {error}
        </span>
      ) : (
        field.help && <span className="adm-field-help">{field.help}</span>
      )}
    </div>
  )
}

function FieldEditor({
  field,
  value,
  onChange,
  id,
}: {
  field: Field
  value: Value
  onChange: (value: Value) => void
  id: string
}) {
  switch (field.kind) {
    case 'group':
      return (
        <div className="adm-group">
          <div className="adm-group-title">{field.label}</div>
          <ObjectEditor fields={field.fields} value={value as Obj} onChange={onChange} id={id} />
        </div>
      )
    case 'list':
      return (
        <ListEditor field={field} value={(value as Value[]) ?? []} onChange={onChange} id={id} />
      )
    case 'image':
      return <ImageField field={field} value={String(value ?? '')} onChange={onChange} id={id} />
    case 'boolean':
      return (
        <label className="adm-check">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      )
    default: {
      const help = 'help' in field ? field.help : undefined
      return (
        <div className={`adm-field ${field.kind === 'textarea' ? 'adm-field-wide' : ''}`}>
          <label className="adm-label" htmlFor={id}>
            {field.label}
          </label>
          {field.kind === 'textarea' ? (
            <textarea
              id={id}
              className="adm-textarea"
              value={String(value ?? '')}
              maxLength={field.max}
              rows={3}
              onChange={(e) => onChange(e.target.value)}
            />
          ) : field.kind === 'select' ? (
            <select
              id={id}
              className="adm-select"
              value={String(value ?? '')}
              onChange={(e) => onChange(e.target.value)}
            >
              {field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={id}
              className="adm-input"
              type={field.kind === 'number' ? 'number' : field.kind === 'email' ? 'email' : 'text'}
              value={
                field.kind === 'number' &&
                (value === '' || value === null || value === undefined || Number.isNaN(value))
                  ? ''
                  : String(value ?? '')
              }
              maxLength={'max' in field ? field.max : 300}
              min={field.kind === 'number' ? field.min : undefined}
              max={field.kind === 'number' ? field.max : undefined}
              step={field.kind === 'number' ? (field.step ?? 1) : undefined}
              onChange={(e) =>
                onChange(
                  field.kind === 'number'
                    ? e.target.value === ''
                      ? ''
                      : Number.isFinite(e.target.valueAsNumber)
                        ? e.target.valueAsNumber
                        : e.target.value
                    : e.target.value,
                )
              }
            />
          )}
          {help && <span className="adm-field-help">{help}</span>}
        </div>
      )
    }
  }
}

function ObjectEditor({
  fields,
  value,
  onChange,
  id,
}: {
  fields: Fields
  value: Obj
  onChange: (value: Obj) => void
  id: string
}) {
  return (
    <div className="adm-grid">
      {Object.entries(fields).map(([key, field]) => (
        <div
          key={key}
          className={
            field.kind === 'group' || field.kind === 'list' || field.kind === 'textarea'
              ? 'adm-field-wide'
              : undefined
          }
        >
          <FieldEditor
            field={field}
            id={`${id}-${key}`}
            value={value?.[key]}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        </div>
      ))}
    </div>
  )
}

function ListEditor({
  field,
  value,
  onChange,
  id,
}: {
  field: Extract<Field, { kind: 'list' }>
  value: Value[]
  onChange: (value: Value[]) => void
  id: string
}) {
  const move = (index: number, delta: number) => {
    const next = [...value]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  return (
    <div className="adm-group">
      <div className="adm-group-title">
        <span>
          {field.label}{' '}
          <span className="adm-sub">
            ({value.length} of max {field.max})
          </span>
        </span>
        <button
          type="button"
          className="adm-btn adm-btn-ghost adm-btn-sm"
          disabled={value.length >= field.max}
          onClick={() => onChange([...value, emptyFor(field.item)])}
        >
          Add {field.itemLabel.toLowerCase()}
        </button>
      </div>
      {field.help && <span className="adm-field-help">{field.help}</span>}
      <div className="adm-list">
        {value.map((item, index) => (
          <div className="adm-group" key={index}>
            <div className="adm-group-title">
              <span>
                {field.itemLabel} {index + 1}
              </span>
              <span className="adm-image-tools">
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${field.itemLabel} ${index + 1} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label={`Move ${field.itemLabel} ${index + 1} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-danger adm-btn-sm"
                  disabled={value.length <= field.min}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </span>
            </div>
            {isFieldMap(field.item) ? (
              <ObjectEditor
                fields={field.item}
                value={item as Obj}
                id={`${id}-${index}`}
                onChange={(next) => onChange(value.map((v, i) => (i === index ? next : v)))}
              />
            ) : (
              <FieldEditor
                field={field.item}
                value={item}
                id={`${id}-${index}`}
                onChange={(next) => onChange(value.map((v, i) => (i === index ? next : v)))}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ContentEditor({
  docKey,
  csrf,
  sections,
  initial,
  canEdit,
}: {
  docKey: string
  csrf: string
  sections: Record<string, SectionDef>
  initial: Obj
  canEdit: boolean
}) {
  const [value, setValue] = useState<Obj>(initial)
  const [dirty, setDirty] = useState(false)
  const { state, pending, formProps } = useActionForm(
    async (prev: Parameters<typeof saveContentAction>[0], fd: FormData) => {
      const result = await saveContentAction(prev, fd)
      if (result?.ok) setDirty(false)
      return result
    },
  )

  return (
    <form {...formProps}>
      <input type="hidden" name="csrf" value={csrf} />
      <input type="hidden" name="key" value={docKey} />
      <input type="hidden" name="content" value={JSON.stringify(value)} />
      {state?.error && (
        <div className="adm-alert adm-alert-error" role="alert">
          {state.error}
        </div>
      )}
      {state?.ok && !dirty && (
        <div className="adm-alert adm-alert-ok" role="status">
          {state.ok}
        </div>
      )}
      <CsrfContext value={csrf}>
        <fieldset disabled={!canEdit} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          {Object.entries(sections).map(([key, section], index) => (
            <details className="adm-section" key={key} open={index === 0}>
              <summary>{section.label}</summary>
              <div className="adm-section-body">
                {section.help && (
                  <p className="adm-help" style={{ margin: 0 }}>
                    {section.help}
                  </p>
                )}
                <ObjectEditor
                  fields={section.fields}
                  id={key}
                  value={value[key] as Obj}
                  onChange={(next) => {
                    setValue((current) => ({ ...current, [key]: next }))
                    setDirty(true)
                  }}
                />
              </div>
            </details>
          ))}
        </fieldset>
      </CsrfContext>
      {canEdit && (
        <div className="adm-sticky-bar">
          <span className="adm-sub">
            {dirty
              ? 'Unsaved changes.'
              : 'Saving stores a draft; the site changes only when you publish.'}
          </span>
          <SubmitButton pending={pending}>Save draft</SubmitButton>
        </div>
      )}
    </form>
  )
}
