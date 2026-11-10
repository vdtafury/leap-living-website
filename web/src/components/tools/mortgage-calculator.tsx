'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRightIcon } from '@/components/ui/icons'

interface MortgageCalculatorProps {
  initialPrice?: number
  propertyTitle?: string
  showPresets?: boolean
}

export function MortgageCalculator({
  initialPrice = 12500000,
  propertyTitle,
  showPresets = true,
}: MortgageCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice)
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(
    initialPrice > 5000000 ? 30 : 20,
  )
  const [loanYears, setLoanYears] = useState<number>(20)
  const [interestRate, setInterestRate] = useState<number>(4.25)

  const calculation = useMemo(() => {
    const downPaymentAed = Math.round((propertyPrice * downPaymentPercent) / 100)
    const loanAmount = Math.max(0, propertyPrice - downPaymentAed)
    const monthlyRate = interestRate / 100 / 12
    const totalMonths = loanYears * 12

    let monthlyPayment = 0
    if (loanAmount > 0 && totalMonths > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / totalMonths
      } else {
        const factor = Math.pow(1 + monthlyRate, totalMonths)
        monthlyPayment = (loanAmount * (monthlyRate * factor)) / (factor - 1)
      }
    }

    const totalRepayment = Math.round(monthlyPayment * totalMonths)
    const totalInterest = Math.max(0, totalRepayment - loanAmount)
    const dldFee = Math.round(propertyPrice * 0.04)
    const trusteeAndReg = Math.round(loanAmount * 0.0025 + 4200)
    const totalUpfront = downPaymentAed + dldFee + trusteeAndReg

    return {
      downPaymentAed,
      loanAmount,
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest,
      dldFee,
      trusteeAndReg,
      totalUpfront,
      equityPercent: downPaymentPercent,
      debtPercent: 100 - downPaymentPercent,
    }
  }, [propertyPrice, downPaymentPercent, loanYears, interestRate])

  const formatAed = (value: number) =>
    'AED ' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })

  return (
    <div className="ll-mortgage-shell">
      <div className="ll-mortgage-controls">
        {propertyTitle && (
          <div className="ll-mortgage-context">
            Financing illustration for <strong>{propertyTitle}</strong>
          </div>
        )}

        {showPresets && (
          <div className="ll-preset-row">
            {[
              { label: 'Boulevard Penthouse · 12.5M', price: 12500000 },
              { label: 'Palm Sky Villa · 14.8M', price: 14800000 },
              { label: 'Golfside Duplex · 9.6M', price: 9600000 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setPropertyPrice(preset.price)}
                className={`ll-segment-chip ${propertyPrice === preset.price ? 'active' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {/* Property Price */}
        <div>
          <div className="ll-control-header">
            <label htmlFor="mc-price" className="ll-field-label">
              Property Price (AED)
            </label>
            <span className="ll-control-value tabular-nums">{formatAed(propertyPrice)}</span>
          </div>
          <input
            id="mc-price"
            type="range"
            min={1500000}
            max={50000000}
            step={100000}
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
            className="ll-range-slider"
          />
          <div className="ll-range-bounds">
            <span>AED 1.5M</span>
            <span>AED 25M</span>
            <span>AED 50M</span>
          </div>
        </div>

        {/* Down Payment */}
        <div>
          <div className="ll-control-header">
            <label htmlFor="mc-down" className="ll-field-label">
              Down Payment ({downPaymentPercent}%)
            </label>
            <span className="ll-control-value ll-value-accent tabular-nums">
              {formatAed(calculation.downPaymentAed)}
            </span>
          </div>
          <input
            id="mc-down"
            type="range"
            min={20}
            max={80}
            step={5}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="ll-range-slider"
          />
          <div className="ll-preset-row" style={{ marginTop: '0.6rem' }}>
            {[
              { label: '20% UAE Resident', pct: 20 },
              { label: '30% Luxury Tier (>5M)', pct: 30 },
              { label: '40% Non-Resident', pct: 40 },
              { label: '50% Conservative', pct: 50 },
            ].map((tier) => (
              <button
                key={tier.pct}
                type="button"
                onClick={() => setDownPaymentPercent(tier.pct)}
                className={`ll-segment-chip ${downPaymentPercent === tier.pct ? 'active' : ''}`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tenure and Rate */}
        <div className="ll-two-col">
          <div>
            <div className="ll-control-header">
              <label htmlFor="mc-years" className="ll-field-label">
                Loan Tenure
              </label>
              <span className="ll-control-value tabular-nums">{loanYears} Years</span>
            </div>
            <input
              id="mc-years"
              type="range"
              min={5}
              max={25}
              step={1}
              value={loanYears}
              onChange={(e) => setLoanYears(Number(e.target.value))}
              className="ll-range-slider"
            />
            <div className="ll-range-bounds">
              <span>5 Yrs</span>
              <span>15 Yrs</span>
              <span>25 Yrs</span>
            </div>
          </div>

          <div>
            <div className="ll-control-header">
              <label htmlFor="mc-rate" className="ll-field-label">
                Interest Rate (p.a.)
              </label>
              <span className="ll-control-value tabular-nums">{interestRate.toFixed(2)}%</span>
            </div>
            <input
              id="mc-rate"
              type="range"
              min={2.5}
              max={7.5}
              step={0.05}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="ll-range-slider"
            />
            <div className="ll-range-bounds">
              <span>2.50%</span>
              <span>4.25%</span>
              <span>7.50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Panel */}
      <div className="ll-mortgage-summary">
        <div>
          <div className="ll-summary-kicker">Estimated Monthly Repayment</div>
          <div className="ll-summary-figure tabular-nums">
            {formatAed(calculation.monthlyPayment)}
            <span className="ll-summary-unit"> / month</span>
          </div>

          <div
            className="ll-equity-bar"
            role="img"
            aria-label={`Equity ${calculation.equityPercent}% vs Financing ${calculation.debtPercent}%`}
          >
            <div
              style={{
                width: `${calculation.equityPercent}%`,
                backgroundColor: '#6CB6B8',
              }}
            />
            <div
              style={{
                width: `${calculation.debtPercent}%`,
                backgroundColor: 'rgba(255,255,255,0.28)',
              }}
            />
          </div>

          <div className="ll-summary-rows tabular-nums">
            <div className="ll-summary-row">
              <span>Principal Financed ({calculation.debtPercent}%)</span>
              <strong>{formatAed(calculation.loanAmount)}</strong>
            </div>
            <div className="ll-summary-row">
              <span>Equity Down Payment ({calculation.equityPercent}%)</span>
              <strong>{formatAed(calculation.downPaymentAed)}</strong>
            </div>
            <div className="ll-summary-row">
              <span>Dubai Land Dept. Transfer (4%)</span>
              <strong>{formatAed(calculation.dldFee)}</strong>
            </div>
            <div className="ll-summary-row">
              <span>Mortgage Reg. &amp; Trustee Est.</span>
              <strong>{formatAed(calculation.trusteeAndReg)}</strong>
            </div>
            <div className="ll-summary-row ll-summary-total">
              <span>Estimated Upfront Capital</span>
              <strong>{formatAed(calculation.totalUpfront)}</strong>
            </div>
          </div>
        </div>

        <div className="ll-summary-actions">
          <Link href="/contact?topic=mortgage" className="ll-btn ll-btn-primary ll-btn-full">
            <span>Request Bank Pre-Approval Advisory</span>
            <ArrowUpRightIcon size={15} />
          </Link>
          <p className="ll-summary-note">
            Indicative planning illustration subject to UAE Central Bank LTV regulations and
            lender underwriting.
          </p>
        </div>
      </div>
    </div>
  )
}
