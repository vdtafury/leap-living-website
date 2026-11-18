'use client'

import { useRef, useState } from 'react'
import type { ActionState } from '../_lib/guard'
import { SubmitButton, useActionForm } from './client'

export interface ImageItem {
  url: string
  alt: string
}

/** Uploads go to /api/upload (session + same origin + CSRF header); the server re-encodes them. */
export function ImagesEditor({
  csrf,
  initial,
  name = 'images',
}: {
  csrf: string
  initial: ImageItem[]
  name?: string
}) {
  const [images, setImages] = useState<ImageItem[]>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setError(null)
    const added: ImageItem[] = []
    for (const file of Array.from(files)) {
      const body = new FormData()
      body.append('file', file)
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body,
          headers: { 'x-csrf-token': csrf },
          credentials: 'same-origin',
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.ok) {
          setError(`${file.name}: ${data.error ?? `upload failed (${response.status})`}`)
          continue
        }
        added.push({ url: data.asset.url, alt: '' })
      } catch {
        setError(`${file.name}: upload failed, check the connection.`)
      }
    }
    setImages((current) => [...current, ...added])
    setBusy(false)
    if (input.current) input.current.value = ''
  }

  const move = (index: number, delta: number) =>
    setImages((current) => {
      const next = [...current]
      const target = index + delta
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  return (
    <div className="adm-field adm-field-wide">
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <span className="adm-label">Images</span>
      <span className="adm-field-help">
        The first image is the cover. JPEG, PNG or WebP up to 5 MB; they are resized and converted
        automatically. Describe each image for screen readers.
      </span>
      {error && (
        <div className="adm-alert adm-alert-error" role="alert">
          {error}
        </div>
      )}
      <div className="adm-images">
        {images.map((image, index) => (
          <div className="adm-image" key={`${image.url}-${index}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" />
            <div className="adm-image-body">
              {index === 0 && <span className="adm-cover-tag">Cover image</span>}
              <input
                className="adm-input"
                aria-label={`Description of image ${index + 1}`}
                placeholder="Image description"
                value={image.alt}
                maxLength={200}
                onChange={(event) =>
                  setImages((current) =>
                    current.map((item, i) =>
                      i === index ? { ...item, alt: event.target.value } : item,
                    ),
                  )
                }
              />
              <div className="adm-image-tools">
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move image ${index + 1} earlier`}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label={`Move image ${index + 1} later`}
                >
                  →
                </button>
                {index > 0 && (
                  <button
                    type="button"
                    className="adm-btn adm-btn-ghost adm-btn-sm"
                    onClick={() =>
                      setImages((current) => [
                        current[index],
                        ...current.filter((_, i) => i !== index),
                      ])
                    }
                  >
                    Make cover
                  </button>
                )}
                <button
                  type="button"
                  className="adm-btn adm-btn-danger adm-btn-sm"
                  onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        <label className="adm-upload">
          <span className="adm-btn adm-btn-ghost adm-btn-sm">
            {busy ? 'Uploading…' : '+ Add images'}
          </span>
          <span className="adm-upload-hint">Click or drop files here</span>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy}
            onChange={(event) => upload(event.target.files)}
          />
        </label>
      </div>
    </div>
  )
}

type Option = { value: string; label: string }

export interface FieldSpec {
  name: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'money'
  options?: Option[]
  help?: string
  required?: boolean
  wide?: boolean
  max?: number
  list?: string[]
  rows?: number
}

function Field({ spec, value }: { spec: FieldSpec; value: string | boolean }) {
  const id = `f-${spec.name}`
  if (spec.type === 'checkbox') {
    return (
      <label className={`adm-check ${spec.wide ? 'adm-field-wide' : ''}`}>
        <input type="checkbox" name={spec.name} defaultChecked={Boolean(value)} />
        <span>{spec.label}</span>
      </label>
    )
  }
  return (
    <div className={`adm-field ${spec.wide ? 'adm-field-wide' : ''}`}>
      <label className="adm-label" htmlFor={id}>
        {spec.label}
        {spec.required && ' *'}
      </label>
      {spec.type === 'textarea' ? (
        <textarea
          id={id}
          name={spec.name}
          className="adm-textarea"
          defaultValue={String(value)}
          maxLength={spec.max}
          rows={spec.rows ?? 4}
        />
      ) : spec.type === 'select' ? (
        <select id={id} name={spec.name} className="adm-select" defaultValue={String(value)}>
          {spec.options!.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <>
          <input
            id={id}
            name={spec.name}
            className="adm-input"
            defaultValue={String(value)}
            required={spec.required}
            maxLength={spec.max}
            inputMode={spec.type === 'number' || spec.type === 'money' ? 'decimal' : undefined}
            list={spec.list ? `${id}-list` : undefined}
          />
          {spec.list && (
            <datalist id={`${id}-list`}>
              {spec.list.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          )}
        </>
      )}
      {spec.help && <span className="adm-field-help">{spec.help}</span>}
    </div>
  )
}

export interface FormSection {
  title: string
  help?: string
  fields: FieldSpec[]
}

/** Property / project editor. All validation happens again on the server. */
export function ListingForm({
  action,
  csrf,
  id,
  sections,
  values,
  images,
  canEdit,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  csrf: string
  id?: string
  sections: FormSection[]
  values: Record<string, string | boolean>
  images: ImageItem[]
  canEdit: boolean
}) {
  const { state, pending, formProps } = useActionForm(action)
  return (
    <form {...formProps} className="adm-form">
      <input type="hidden" name="csrf" value={csrf} />
      {id && <input type="hidden" name="id" value={id} />}
      {state?.error && (
        <div className="adm-alert adm-alert-error" role="alert">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="adm-alert adm-alert-ok" role="status">
          {state.ok}
        </div>
      )}
      <fieldset disabled={!canEdit} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        {sections.map((section) => (
          <div className="adm-card" key={section.title}>
            <h2>{section.title}</h2>
            {section.help && <p className="adm-help">{section.help}</p>}
            <div className="adm-grid">
              {section.fields.map((spec) => (
                <Field key={spec.name} spec={spec} value={values[spec.name] ?? ''} />
              ))}
            </div>
          </div>
        ))}
        <div className="adm-card">
          <h2>Images</h2>
          <ImagesEditor csrf={csrf} initial={images} />
        </div>
      </fieldset>
      {canEdit && (
        <div className="adm-sticky-bar">
          <span className="adm-sub">
            Saving never publishes: use the Publish button once the listing is ready.
          </span>
          <SubmitButton pending={pending}>{id ? 'Save changes' : 'Create draft'}</SubmitButton>
        </div>
      )}
    </form>
  )
}
