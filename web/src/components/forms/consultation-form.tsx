'use client'

import { useState, type FormEvent } from 'react'
import { ArrowUpRightIcon, CheckIcon } from '@/components/ui/icons'

interface ConsultationFormProps {
  mode?: 'VALUATION' | 'CONSULTATION' | 'PROPERTY_INQUIRY' | 'PROJECT_BRIEFING'
  contextTitle?: string
  darkSurface?: boolean
}

export function ConsultationForm({
  mode = 'CONSULTATION',
  contextTitle,
  darkSurface = false,
}: ConsultationFormProps) {
  const [selectedType, setSelectedType] = useState<'VALUATION' | 'CONSULTATION'>(
    mode === 'VALUATION' ? 'VALUATION' : 'CONSULTATION',
  )
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

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

      <form onSubmit={handleSubmit} className="ll-form-grid">
        <div className="ll-two-col">
          <div>
            <label htmlFor="cf-name" className="ll-field-label">
              Full Name
            </label>
            <input
              id="cf-name"
              required
              placeholder="Your full name"
              className="ll-input"
            />
          </div>
          <div>
            <label htmlFor="cf-phone" className="ll-field-label">
              Phone / WhatsApp
            </label>
            <input
              id="cf-phone"
              required
              placeholder="+971 5X XXX XXXX"
              className="ll-input"
            />
          </div>
        </div>

        <div className="ll-two-col">
          <div>
            <label htmlFor="cf-email" className="ll-field-label">
              Email Address
            </label>
            <input
              id="cf-email"
              type="email"
              required
              placeholder="name@company.com"
              className="ll-input"
            />
          </div>
          <div>
            <label htmlFor="cf-community" className="ll-field-label">
              {selectedType === 'VALUATION' ? 'Community / Property Type' : 'Investment Interest'}
            </label>
            <input
              id="cf-community"
              required
              defaultValue={contextTitle ?? ''}
              placeholder="e.g. Palm Jumeirah Villa"
              className="ll-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cf-notes" className="ll-field-label">
            Mandate Notes (Optional)
          </label>
          <textarea
            id="cf-notes"
            rows={3}
            placeholder="Share target timelines, unit preferences, or asset valuation questions..."
            className="ll-input ll-textarea"
          />
        </div>

        <button type="submit" className="ll-btn ll-btn-primary ll-btn-full">
          <span>
            {mode === 'PROPERTY_INQUIRY'
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
