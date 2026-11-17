'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRightIcon, CalculatorIcon } from '@/components/ui/icons'
import { formatAmountInput, monthlyPayment, parseAmount } from '@/lib/mortgage'

/**
 * Compact homepage mortgage calculator (owner's reference, 2026-11-17): four inputs in a row,
 * the monthly payment underneath, a consultation button and an "Apply for home loan" link.
 * The navbar "Mortgage Calculator" button scrolls here (`/#mortgage-calculator`).
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

export function HomeMortgageCalculator() {
  const uid = useId()

  // Arrivals (/mortgage redirect, links from other pages) and same-page clicks on any
  // link to the calculator (navbar button, buyer tile, footer).
  useEffect(() => {
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
  }, [])
  const [price, setPrice] = useState('2,500,000')
  const [downPayment, setDownPayment] = useState('20')
  const [rate, setRate] = useState('4.25')
  const [years, setYears] = useState('25')

  const monthly = monthlyPayment({
    price: parseAmount(price),
    downPaymentPercent: parseAmount(downPayment),
    interestRatePercent: parseAmount(rate),
    years: parseAmount(years),
  })

  const fields = [
    {
      id: `${uid}-price`,
      label: 'Total Price (AED)',
      value: price,
      onChange: (v: string) => setPrice(formatAmountInput(v)),
    },
    {
      id: `${uid}-down`,
      label: 'Down Payment (%)',
      value: downPayment,
      onChange: (v: string) => setDownPayment(v.replace(/[^\d.]/g, '')),
    },
    {
      id: `${uid}-rate`,
      label: 'Interest Rate (%)',
      value: rate,
      onChange: (v: string) => setRate(v.replace(/[^\d.]/g, '')),
    },
    {
      id: `${uid}-years`,
      label: 'Loan Period (Years)',
      value: years,
      onChange: (v: string) => setYears(v.replace(/\D/g, '')),
    },
  ]

  return (
    <div id={ANCHOR} className="ll-hmc">
      <div className="ll-advice-kicker">
        <span className="ll-advice-icon" aria-hidden="true">
          <CalculatorIcon size={18} />
        </span>
        For Buyers
      </div>
      <h3 className="ll-hmc-title">Mortgage Calculator</h3>
      <p className="ll-hmc-desc">
        Estimate your monthly repayment in seconds. Adjust the figures to match your plans.
      </p>

      <div className="ll-hmc-fields">
        {fields.map((field) => (
          <div key={field.id} className="ll-hmc-field">
            <label htmlFor={field.id}>{field.label}</label>
            <input
              id={field.id}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="ll-hmc-result-row">
        <div className="ll-hmc-result">
          <div className="ll-hmc-result-label">Monthly Payments</div>
          <div className="ll-hmc-result-figure tabular-nums" aria-live="polite">
            {monthly === null ? (
              'Enter valid figures'
            ) : (
              <>
                AED{' '}
                {monthly.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span> /month</span>
              </>
            )}
          </div>
        </div>
        <Link href="/contact?topic=mortgage" className="ll-btn ll-hmc-cta">
          Get a Free Consultation
        </Link>
      </div>

      <div className="ll-hmc-apply">
        <Link href="/contact?topic=mortgage">Apply For Home Loan</Link>
        <span>Contact us to get started with your mortgage.</span>
        <ArrowUpRightIcon size={14} aria-hidden="true" />
      </div>

      <p className="ll-hmc-note">
        Indicative figure for principal and interest only. Fees and lender terms apply.
      </p>
    </div>
  )
}
