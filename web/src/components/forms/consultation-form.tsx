'use client'

import { useId, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount } from '@/components/account/account-provider'
import { useSiteContact } from '@/components/layout/site-contact'
import { ArrowUpRightIcon, CheckIcon } from '@/components/ui/icons'
import { fieldErrors, inquirySchema, type InquiryType } from '@/lib/inquiry'

interface ConsultationFormProps {
  mode?: InquiryType
  contextTitle?: string
  darkSurface?: boolean
}

export function ConsultationForm({
  mode = 'CONSULTATION',
  contextTitle,
  darkSurface = false,
}: ConsultationFormProps) {
  const formId = useId()
  const contact = useSiteContact()
  const fallbackError = `We could not send your request. Please try again, or call ${contact?.phoneDisplay ?? '+971 52 145 9888'}.`
  const [selectedType, setSelectedType] = useState<'VALUATION' | 'CONSULTATION'>(
    mode === 'VALUATION' ? 'VALUATION' : 'CONSULTATION',
  )
  const pathname = usePathname()
  // Signed in on the website (D-40): the visitor's details are filled in, still editable.
  const { account } = useAccount()
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  // Saved in the database by /api/inquiries; success is shown only once the server confirms.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return
    const form = new FormData(event.currentTarget)
    const text = (name: string) => String(form.get(name) ?? '')
    const payload = {
      type: mode === 'VALUATION' || mode === 'CONSULTATION' ? selectedType : mode,
      name: text('name'),
      phone: text('phone'),
      email: text('email'),
      interest: text('interest'),
      notes: text('notes'),
      context: contextTitle,
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
        setSubmitted(true)
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

  if (submitted) {
    return (
      <div className={`ll-form-card ${darkSurface ? 'on-dark' : ''}`}>
        <div className="ll-form-success">
          <div className="ll-form-success-icon">
            <CheckIcon size={20} />
          </div>
          <h3>Advisory Request Recorded</h3>
          <p>
            A senior consultant at Leap Living will review your mandate details
            {contextTitle ? ` regarding ${contextTitle}` : ''} and respond directly.
          </p>
          {account && (
            <p>
              You can follow it in <Link href="/account#requests">My account</Link>.
            </p>
          )}
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="ll-btn ll-btn-outline"
            style={{ marginTop: '1rem' }}
          >
            Submit Another Brief
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`ll-form-card ${darkSurface ? 'on-dark' : ''}`}>
      {(mode === 'VALUATION' || mode === 'CONSULTATION') && (
        <div className="ll-form-switcher" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={selectedType === 'VALUATION'}
            onClick={() => setSelectedType('VALUATION')}
            className={`ll-switch-tab ${selectedType === 'VALUATION' ? 'active' : ''}`}
          >
            Free Property Valuation
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedType === 'CONSULTATION'}
            onClick={() => setSelectedType('CONSULTATION')}
            className={`ll-switch-tab ${selectedType === 'CONSULTATION' ? 'active' : ''}`}
          >
            Private Consultancy
          </button>
        </div>
      )}

      {contextTitle && (
        <div className="ll-form-context">
          <span>Regarding</span>
          <strong>{contextTitle}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ll-form-grid" noValidate>
        {/* Honeypot: invisible to people (and to screen readers), filled only by bots. */}
        <div className="ll-hp" aria-hidden="true">
          <label htmlFor={`${formId}-website`}>Website</label>
          <input id={`${formId}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="ll-two-col">
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
        </div>

        <div className="ll-two-col">
          <div>
            <label htmlFor={`${formId}-email`} className="ll-field-label">
              Email Address
            </label>
            <input
              id={`${formId}-email`}
              name="email"
              defaultValue={account?.email ?? ''}
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              placeholder="name@company.com"
              className="ll-input"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy('email')}
            />
            {fieldError('email')}
          </div>
          <div>
            <label htmlFor={`${formId}-community`} className="ll-field-label">
              {selectedType === 'VALUATION' ? 'Community / Property Type' : 'Investment Interest'}
            </label>
            <input
              id={`${formId}-community`}
              name="interest"
              required
              maxLength={200}
              defaultValue={contextTitle ?? ''}
              placeholder="e.g. Palm Jumeirah Villa"
              className="ll-input"
              aria-invalid={Boolean(errors.interest)}
              aria-describedby={describedBy('interest')}
            />
            {fieldError('interest')}
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-notes`} className="ll-field-label">
            Mandate Notes (Optional)
          </label>
          <textarea
            id={`${formId}-notes`}
            name="notes"
            rows={3}
            maxLength={2000}
            placeholder="Share target timelines, unit preferences, or asset valuation questions..."
            className="ll-input ll-textarea"
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={describedBy('notes')}
          />
          {fieldError('notes')}
        </div>

        {formError && (
          <p className="ll-form-error" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="ll-btn ll-btn-primary ll-btn-full"
          disabled={sending}
          aria-busy={sending}
        >
          <span>
            {sending
              ? 'Sending…'
              : mode === 'PROPERTY_INQUIRY'
                ? 'Request Private Viewing & Dossier'
                : mode === 'PROJECT_BRIEFING'
                  ? 'Request Developer Floorplans & Availability'
                  : selectedType === 'VALUATION'
                    ? 'Submit Valuation Request'
                    : 'Schedule Private Consultation'}
          </span>
          <ArrowUpRightIcon size={15} />
        </button>
      </form>
    </div>
  )
}
