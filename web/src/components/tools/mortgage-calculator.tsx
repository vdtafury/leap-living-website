'use client'

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRightIcon, CalculatorIcon } from '@/components/ui/icons'
import {
  MAX_LOAN_YEARS,
  PRICE_SLIDER,
  formatAmountInput,
  loanAmount,
  monthlyPayment,
  parseAmount,
  priceToSlider,
  sliderToPrice,
  totalInterest,
} from '@/lib/mortgage'

/**
 * Mortgage calculator (D-51, after Property Finder / Bayut and the UAE bank calculators):
 * inputs on the left, each a typed value with a slider under it; the result on the right in its
 * own panel (monthly payment, principal / interest bar, loan amount, down payment, total
 * interest), with one primary action. Side by side when the card is wide enough (container
 * query), stacked otherwise. One component for both places:
 * - `variant="home"`: the homepage calculator card. The navbar "Mortgage Calculator" button
 *   scrolls here (`/#mortgage-calculator`).
 * - `variant="property"`: on a property page, prefilled with its price.
 */
const ANCHOR = 'mortgage-calculator'
const ANCHOR_LINKS = `a[href="/#${ANCHOR}"], a[href="#${ANCHOR}"]`

/**
 * Scrolls to the calculator reliably. Sections above it use `content-visibility: auto`
 * (estimated heights), so a plain hash jump lands in the wrong place once they render.
 * `ll-render-all` renders them first; the scroll then runs on real heights.
 */
function revealCalculator(smooth: boolean) {
  const target = document.getElementById(ANCHOR)
  if (!target) return
  document.documentElement.classList.add('ll-render-all')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      target.scrollIntoView({ behavior: smooth && !reduceMotion ? 'smooth' : 'instant' }),
    ),
  )
}

interface MortgageCalculatorProps {
  variant?: 'home' | 'property'
  /** Prefilled price in AED (property pages) */
  initialPrice?: number
  /** Default rate / down payment / term (CMS settings on the homepage) */
  defaults?: { interestRate?: number; downPaymentPercent?: number; years?: number }
}

const DEFAULT_PRICE = 2_500_000
const DOWN = { min: 10, max: 80, step: 1 }
const RATE = { min: 1, max: 10, step: 0.05 }
const YEARS = { min: 1, max: MAX_LOAN_YEARS, step: 1 }

const aed = (n: number) => `AED ${Math.round(n).toLocaleString('en-US')}`
const clamp = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min
/** Share of the track left of the thumb, for the filled part of the slider. */
const fill = (value: number, min: number, max: number) =>
  ({ '--ll-fill': `${((clamp(value, min, max) - min) / (max - min)) * 100}%` }) as CSSProperties

interface FieldProps {
  id: string
  label: string
  value: string
  onType: (value: string) => void
  prefix?: string
  suffix?: string
  /** Slider: position, bounds and what to do when it moves */
  slider: { value: number; min: number; max: number; step: number; text: string }
  onSlide: (position: number) => void
  hint?: ReactNode
}

function Field({ id, label, value, onType, prefix, suffix, slider, onSlide, hint }: FieldProps) {
  return (
    <div className="ll-hmc-field">
      <div className="ll-hmc-field-top">
        <label htmlFor={id}>{label}</label>
        {hint && <span className="ll-hmc-hint tabular-nums">{hint}</span>}
      </div>
      <div className="ll-hmc-input">
        {prefix && <span aria-hidden="true">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onType(e.target.value)}
        />
        {suffix && <span aria-hidden="true">{suffix}</span>}
      </div>
      <input
        type="range"
        className="ll-hmc-range"
        aria-label={`${label} slider`}
        aria-valuetext={slider.text}
        min={slider.min}
        max={slider.max}
        step={slider.step}
        value={clamp(slider.value, slider.min, slider.max)}
        style={fill(slider.value, slider.min, slider.max)}
        onChange={(e) => onSlide(Number(e.target.value))}
      />
    </div>
  )
}

export function MortgageCalculator({
  variant = 'home',
  initialPrice = DEFAULT_PRICE,
  defaults = {},
}: MortgageCalculatorProps) {
  const uid = useId()
  const isHome = variant === 'home'

  // Arrivals (/mortgage redirect, links from other pages) and same-page clicks on any
  // link to the calculator (navbar button, footer).
  useEffect(() => {
    if (!isHome) return
    if (window.location.hash === `#${ANCHOR}`) revealCalculator(false)

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const link = event.target instanceof Element ? event.target.closest(ANCHOR_LINKS) : null
      if (!link) return
      event.preventDefault() // Next.js Link skips its own navigation; its onClick still runs
      if (window.location.hash !== `#${ANCHOR}`) window.history.pushState(null, '', `#${ANCHOR}`)
      revealCalculator(true)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [isHome])

  // UAE LTV rule of thumb: 20% down up to AED 5M, 30% above (the lender decides)
  const [price, setPrice] = useState(formatAmountInput(String(Math.round(initialPrice))))
  const [downPayment, setDownPayment] = useState(
    String(defaults.downPaymentPercent ?? (initialPrice > 5_000_000 ? 30 : 20)),
  )
  const [rate, setRate] = useState(String(defaults.interestRate ?? 4.25))
  const [years, setYears] = useState(String(defaults.years ?? 25))

  const n = {
    price: parseAmount(price),
    down: parseAmount(downPayment),
    rate: parseAmount(rate),
    years: parseAmount(years),
  }
  const monthly = monthlyPayment({
    price: n.price,
    downPaymentPercent: n.down,
    interestRatePercent: n.rate,
    years: n.years,
  })
  const loan = monthly === null ? 0 : loanAmount(n.price, n.down)
  const interest = totalInterest(monthly, loan, n.years)
  const principalShare = loan + interest > 0 ? (loan / (loan + interest)) * 100 : 100

  return (
    <div
      id={isHome ? ANCHOR : undefined}
      className={`ll-hmc ${isHome ? 'll-hmc--home' : 'll-hmc--property'}`}
    >
      <div className="ll-hmc-grid">
        <div className="ll-hmc-inputs">
          {isHome && (
            <>
              <div className="ll-advice-kicker">
                <span className="ll-advice-icon" aria-hidden="true">
                  <CalculatorIcon size={17} />
                </span>
                For Buyers
              </div>
              <h3 className="ll-hmc-title">Mortgage Calculator</h3>
            </>
          )}
          <p className="ll-hmc-desc">
            {isHome
              ? 'Estimate your monthly repayment in seconds. Adjust the figures to match your plans.'
              : 'Prefilled with this property’s price. Adjust the figures to match your plans.'}
          </p>

          <div className="ll-hmc-fields">
            <Field
              id={`${uid}-price`}
              label="Property price"
              prefix="AED"
              value={price}
              onType={(v) => setPrice(formatAmountInput(v))}
              slider={{
                value: priceToSlider(n.price),
                min: 0,
                max: PRICE_SLIDER.steps,
                step: 1,
                text: Number.isFinite(n.price) ? aed(n.price) : 'Not set',
              }}
              onSlide={(pos) => setPrice(formatAmountInput(String(sliderToPrice(pos))))}
            />
            <Field
              id={`${uid}-down`}
              label="Down payment"
              suffix="%"
              value={downPayment}
              onType={(v) => setDownPayment(v.replace(/[^\d.]/g, ''))}
              slider={{ ...DOWN, value: n.down, text: `${downPayment || 0} percent` }}
              onSlide={(v) => setDownPayment(String(v))}
              hint={
                Number.isFinite(n.price) && Number.isFinite(n.down) ? (
                  <span className="tabular-nums">
                    {aed((n.price * clamp(n.down, 0, 100)) / 100)}
                  </span>
                ) : null
              }
            />
            <Field
              id={`${uid}-rate`}
              label="Interest rate"
              suffix="%"
              value={rate}
              onType={(v) => setRate(v.replace(/[^\d.]/g, ''))}
              slider={{ ...RATE, value: n.rate, text: `${rate || 0} percent` }}
              onSlide={(v) => setRate(String(Math.round(v * 100) / 100))}
            />
            <Field
              id={`${uid}-years`}
              label="Loan period"
              suffix="years"
              value={years}
              onType={(v) => setYears(v.replace(/\D/g, ''))}
              slider={{ ...YEARS, value: n.years, text: `${years || 0} years` }}
              onSlide={(v) => setYears(String(v))}
            />
          </div>
        </div>

        <div className="ll-hmc-summary">
          <div className="ll-hmc-result-label">Estimated monthly payment</div>
          <div className="ll-hmc-result-figure tabular-nums" aria-live="polite">
            {monthly === null ? (
              'Enter valid figures'
            ) : (
              <>
                {aed(monthly)}
                <span> /month</span>
              </>
            )}
          </div>
          {monthly !== null && (
            <div className="ll-hmc-result-sub">
              at {rate}% over {years} {n.years === 1 ? 'year' : 'years'}
            </div>
          )}

          <div className="ll-hmc-split" aria-hidden="true">
            <span style={{ width: `${principalShare}%` }} />
          </div>
          <dl className="ll-hmc-rows tabular-nums">
            <div>
              <dt>
                <i className="ll-hmc-dot ll-hmc-dot--principal" aria-hidden="true" />
                Loan amount
              </dt>
              <dd>{aed(loan)}</dd>
            </div>
            <div>
              <dt>
                <i className="ll-hmc-dot ll-hmc-dot--interest" aria-hidden="true" />
                Total interest
              </dt>
              <dd>{aed(interest)}</dd>
            </div>
            <div className="ll-hmc-row-total">
              <dt>Total repayment</dt>
              <dd>{aed(loan + interest)}</dd>
            </div>
          </dl>

          <Link href="/contact?topic=mortgage" className="ll-btn ll-btn-primary ll-hmc-cta">
            <span>Get a Free Consultation</span>
            <ArrowUpRightIcon size={15} />
          </Link>
          <p className="ll-hmc-note">
            Indicative figure for principal and interest only. Fees and lender terms apply.
          </p>
        </div>
      </div>
    </div>
  )
}
