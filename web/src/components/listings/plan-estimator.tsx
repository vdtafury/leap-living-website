'use client'

import Link from 'next/link'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { useSiteContact } from '@/components/layout/site-contact'
import { ArrowRightIcon, ArrowUpRightIcon, PhoneIcon, WhatsAppIcon } from '@/components/ui/icons'
import { briefWhatsappLink } from '@/lib/contact-links'
import {
  DEFAULT_INTEREST_RATE,
  DEFAULT_LOAN_YEARS,
  DLD_FEE_PERCENT,
  buyBudgetFor,
  defaultDownPayment,
  formatAed,
  loanAmount,
  monthlyPayment,
  priceForPayment,
  priceToSlider,
  sliderToPrice,
} from '@/lib/mortgage'

/* Annual rent slider (Rent page): log scale, so AED 50k–400k gets most of the track. */
const RENT = { min: 50_000, max: 1_500_000, steps: 1000 }
const rentToSlider = (rent: number) =>
  Math.round((Math.log(rent / RENT.min) / Math.log(RENT.max / RENT.min)) * RENT.steps)
const sliderToRent = (position: number) => {
  const raw = RENT.min * Math.exp((position / RENT.steps) * Math.log(RENT.max / RENT.min))
  return Math.min(RENT.max, Math.max(RENT.min, Math.round(raw / 5_000) * 5_000))
}

const short = (value: number) =>
  value >= 1_000_000 ? `${+(value / 1_000_000).toFixed(1)}M` : `${Math.round(value / 1_000)}K`

/**
 * The interactive tile of "Plan your purchase / Plan your move".
 * - BUY: property price → estimated monthly repayment, down payment, loan, DLD fee.
 * - RENT: annual rent → the price of a home with the same monthly mortgage payment.
 * Same maths and defaults as the homepage calculator (lib/mortgage.ts).
 */
export function PlanEstimator({
  mode,
  icon,
  tag,
  title,
}: {
  mode: 'BUY' | 'RENT'
  /** Rendered icon (a component cannot cross the server → client boundary) */
  icon: ReactNode
  tag: string
  title: string
}) {
  const id = useId()
  const [position, setPosition] = useState(() =>
    mode === 'BUY' ? priceToSlider(2_500_000) : rentToSlider(150_000),
  )
  const steps = mode === 'BUY' ? 1000 : RENT.steps
  const fill = { '--fill': `${(position / steps) * 100}%` } as CSSProperties

  const input = mode === 'BUY' ? sliderToPrice(position) : sliderToRent(position)
  // Rent → price is a rough guide, so it is rounded to AED 10,000.
  const price = mode === 'BUY' ? input : Math.round(priceForPayment(input / 12) / 10_000) * 10_000
  const down = defaultDownPayment(price)
  const monthly =
    monthlyPayment({
      price,
      downPaymentPercent: down,
      interestRatePercent: DEFAULT_INTEREST_RATE,
      years: DEFAULT_LOAN_YEARS,
    }) ?? 0
  const loan = loanAmount(price, down)
  const dld = (price * DLD_FEE_PERCENT) / 100

  const rows =
    mode === 'BUY'
      ? [
          { label: `Down payment · ${down}%`, value: price - loan },
          { label: 'Loan amount', value: loan },
          { label: `DLD fee · ${DLD_FEE_PERCENT}%`, value: dld },
        ]
      : [
          { label: 'Monthly rent', value: input / 12 },
          { label: `Down payment · ${down}%`, value: price - loan },
          { label: `DLD fee · ${DLD_FEE_PERCENT}%`, value: dld },
        ]

  return (
    <div className="ll-plan-tool">
      <div className="ll-plan-tool-head">
        <span className="ll-plan-tag">
          {icon}
          {tag}
        </span>
        <h3 className="ll-plan-tool-title">{title}</h3>
      </div>

      <div className="ll-plan-readout" aria-live="polite">
        <span className="ll-plan-readout-label">
          {mode === 'BUY' ? 'Estimated monthly repayment' : 'Your rent could carry a home of about'}
        </span>
        <strong className="ll-plan-readout-value">
          <small>AED</small> {formatAed(mode === 'BUY' ? monthly : price)}
          {mode === 'BUY' && <small> / month</small>}
        </strong>
      </div>

      <div className="ll-plan-slider">
        <div className="ll-plan-slider-top">
          <label htmlFor={`${id}-range`}>{mode === 'BUY' ? 'Property price' : 'Annual rent'}</label>
          <output htmlFor={`${id}-range`}>AED {formatAed(input)}</output>
        </div>
        <input
          id={`${id}-range`}
          type="range"
          className="ll-plan-range"
          min={0}
          max={steps}
          step={1}
          value={position}
          style={fill}
          aria-valuetext={`AED ${formatAed(input)}`}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
        <div className="ll-plan-scale" aria-hidden="true">
          <span>AED {short(mode === 'BUY' ? 500_000 : RENT.min)}</span>
          <span>AED {short(mode === 'BUY' ? 50_000_000 : RENT.max)}</span>
        </div>
      </div>

      <dl className="ll-plan-breakdown">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>AED {formatAed(row.value)}</dd>
          </div>
        ))}
      </dl>

      <p className="ll-plan-note">
        {mode === 'BUY' ? '' : 'Same monthly payment as your rent. '}At {DEFAULT_INTEREST_RATE}%
        over {DEFAULT_LOAN_YEARS} years; a guide only, the bank sets the final terms.
      </p>

      <div className="ll-plan-actions">
        {mode === 'RENT' && (
          <Link href={`/buy?budget=${buyBudgetFor(price)}`} className="ll-btn ll-btn-primary">
            <span>See homes for sale</span>
            <ArrowRightIcon size={15} />
          </Link>
        )}
        <Link
          href="/#mortgage-calculator"
          className={`ll-btn ${mode === 'BUY' ? 'll-btn-primary' : 'll-btn-outline'}`}
        >
          <span>Open the full calculator</span>
          <ArrowUpRightIcon size={15} />
        </Link>
      </div>
    </div>
  )
}

/** WhatsApp and call buttons of the consultation tile (numbers from Admin → Site settings). */
export function PlanDirectLines({ mode }: { mode: 'BUY' | 'RENT' }) {
  const contact = useSiteContact()
  if (!contact) return null
  const whatsapp = briefWhatsappLink(contact, mode)
  return (
    <>
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="ll-plan-line"
          aria-label="Message us on WhatsApp"
        >
          <WhatsAppIcon size={18} />
          <span className="ll-plan-line-label">WhatsApp</span>
        </a>
      )}
      {contact.phoneHref && (
        <a
          href={contact.phoneHref}
          className="ll-plan-line"
          aria-label={`Call ${contact.phoneDisplay}`}
        >
          <PhoneIcon size={17} />
          <span className="ll-plan-line-label">Call</span>
        </a>
      )}
    </>
  )
}
