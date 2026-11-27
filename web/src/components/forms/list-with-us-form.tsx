'use client'

import { useId, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount } from '@/components/account/account-provider'
import { useSiteContact } from '@/components/layout/site-contact'
import { ArrowUpRightIcon, CheckIcon } from '@/components/ui/icons'
import { fieldErrors, inquirySchema } from '@/lib/inquiry'

/**
 * Quick 3-field owner intake form ("List with us" on /sell): collects only name, phone/WhatsApp,
 * and community, persisting through the same /api/inquiries endpoint as full consultation forms.
 */
export function ListWithUsForm() {
  const formId = useId()
  const pathname = usePathname()
  const contact = useSiteContact()
  const { account } = useAccount()
  const fallbackError = `We could not send your request. Please try again, or call ${contact?.phoneDisplay ?? '+971 52 145 9888'}.`

  const [submittedCommunity, setSubmittedCommunity] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return
    const form = new FormData(event.currentTarget)
    const text = (name: string) => String(form.get(name) ?? '')
    const payload = {
      type: 'LIST_PROPERTY' as const,
      name: text('name'),
      phone: text('phone'),
      email: '',
      interest: text('interest'),
      notes: '',
      context: 'List With Us',
      pagePath: pathname,
      website: text('website'),
    }
    const checked = inquirySchema.safeParse(payload)
    if (!checked.success) {
      setErrors(fieldErrors(checked.error))
      return
    }
    setErrors({})
    setFormError(null)
    setSending(true)
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = (await response.json().catch(() => ({}))) as {
        error?: string
        fields?: Record<string, string>
      }
      if (response.ok) {
        setSubmittedCommunity(checked.data.interest)
      } else if (result.fields && Object.keys(result.fields).length > 0) {
        setErrors(result.fields)
        setFormError(null)
      } else {
        setFormError(result.error || fallbackError)
      }
    } catch {
      setFormError(fallbackError)
    } finally {
      setSending(false)
    }
  }

  const describedBy = (field: string) => (errors[field] ? `${formId}-${field}-error` : undefined)
  const fieldError = (field: string) =>
    errors[field] ? (
      <p id={`${formId}-${field}-error`} className="ll-field-error">
        {errors[field]}
      </p>
    ) : null

  if (submittedCommunity !== null) {
    return (
      <div className="ll-form-card">
        <div className="ll-form-success">
          <div className="ll-form-success-icon">
            <CheckIcon size={20} />
          </div>
          <h3>Listing Request Recorded</h3>
          <p>
            A senior consultant at Leap Living will call you directly regarding your property in{' '}
            <strong>{submittedCommunity}</strong>.
          </p>
          {account && (
            <p>
              You can follow it in <Link href="/account#requests">My account</Link>.
            </p>
          )}
          <button
            type="button"
            onClick={() => setSubmittedCommunity(null)}
            className="ll-btn ll-btn-outline"
            style={{ marginTop: '1rem' }}
          >
            Submit Another Property
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ll-form-card">
      <form onSubmit={handleSubmit} className="ll-quick-form" noValidate>
        <div className="ll-hp" aria-hidden="true">
          <label htmlFor={`${formId}-website`}>Website</label>
          <input id={`${formId}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="ll-quick-form-grid">
          <div>
            <label htmlFor={`${formId}-name`} className="ll-field-label">
              Full Name
            </label>
            <input
              id={`${formId}-name`}
              name="name"
              defaultValue={account?.name ?? ''}
              required
              autoComplete="name"
              maxLength={120}
              placeholder="Your full name"
              className="ll-input"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy('name')}
            />
            {fieldError('name')}
          </div>

          <div>
            <label htmlFor={`${formId}-phone`} className="ll-field-label">
              Phone / WhatsApp
            </label>
            <input
              id={`${formId}-phone`}
              name="phone"
              defaultValue={account?.phone ?? ''}
              type="tel"
              required
              autoComplete="tel"
              maxLength={40}
              placeholder="+971 5X XXX XXXX"
              className="ll-input"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy('phone')}
            />
            {fieldError('phone')}
          </div>

          <div>
            <label htmlFor={`${formId}-community`} className="ll-field-label">
              Community
            </label>
            <input
              id={`${formId}-community`}
              name="interest"
              required
              maxLength={200}
              placeholder="e.g. Palm Jumeirah, Dubai Hills"
              className="ll-input"
              aria-invalid={Boolean(errors.interest)}
              aria-describedby={describedBy('interest')}
            />
            {fieldError('interest')}
          </div>

          <div className="ll-quick-form-submit">
            <button
              type="submit"
              className="ll-btn ll-btn-primary ll-btn-full"
              disabled={sending}
              aria-busy={sending}
            >
              <span>{sending ? 'Sending…' : 'List With Us'}</span>
              <ArrowUpRightIcon size={15} />
            </button>
          </div>
        </div>

        {formError && (
          <p className="ll-form-error" role="alert" style={{ marginTop: '0.85rem' }}>
            {formError}
          </p>
        )}
      </form>
    </div>
  )
}
