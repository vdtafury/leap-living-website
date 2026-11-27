import { describe, expect, it } from 'vitest'
import {
  PRICE_SLIDER,
  buyBudgetFor,
  defaultDownPayment,
  formatAed,
  loanForPayment,
  priceForPayment,
  formatAmountInput,
  loanAmount,
  monthlyPayment,
  parseAmount,
  priceToSlider,
  sliderToPrice,
  totalInterest,
} from './mortgage'

describe('monthlyPayment', () => {
  it('matches the reference calculator (USD 816,882, 25%, 3.75%, 25 years = 3149.88)', () => {
    const m = monthlyPayment({
      price: 816882,
      downPaymentPercent: 25,
      interestRatePercent: 3.75,
      years: 25,
    })
    expect(m).not.toBeNull()
    expect(m!.toFixed(2)).toBe('3149.88')
  })

  it('splits the loan evenly at a 0% rate', () => {
    expect(
      monthlyPayment({
        price: 1_200_000,
        downPaymentPercent: 0,
        interestRatePercent: 0,
        years: 10,
      }),
    ).toBe(10_000)
  })

  it('is 0 when the down payment covers the price', () => {
    expect(
      monthlyPayment({
        price: 1_000_000,
        downPaymentPercent: 100,
        interestRatePercent: 4,
        years: 20,
      }),
    ).toBe(0)
  })

  it('returns null for input that cannot be priced', () => {
    const base = { price: 2_000_000, downPaymentPercent: 20, interestRatePercent: 4.25, years: 25 }
    expect(monthlyPayment({ ...base, price: Number.NaN })).toBeNull()
    expect(monthlyPayment({ ...base, price: 0 })).toBeNull()
    expect(monthlyPayment({ ...base, years: 0 })).toBeNull()
    expect(monthlyPayment({ ...base, years: 0.01 })).toBeNull()
    expect(monthlyPayment({ ...base, downPaymentPercent: 120 })).toBeNull()
    expect(monthlyPayment({ ...base, interestRatePercent: -1 })).toBeNull()
    expect(monthlyPayment({ ...base, interestRatePercent: 100_000 })).toBeNull()
  })
})

describe('loanAmount', () => {
  it('subtracts the down payment', () => {
    expect(loanAmount(2_000_000, 20)).toBe(1_600_000)
  })
})

describe('input helpers', () => {
  it('parses grouped numbers', () => {
    expect(parseAmount('2,500,000')).toBe(2_500_000)
    expect(parseAmount(' 4.25 ')).toBe(4.25)
    expect(parseAmount('')).toBeNaN()
    expect(parseAmount('abc')).toBeNaN()
  })

  it('groups thousands while typing', () => {
    expect(formatAmountInput('2500000')).toBe('2,500,000')
    expect(formatAmountInput('2,500,0001')).toBe('25,000,001')
    expect(formatAmountInput('1234.567')).toBe('1,234.56')
    expect(formatAmountInput('007')).toBe('7')
    expect(formatAmountInput('')).toBe('')
  })

  it('totals the interest over the term', () => {
    const monthly = monthlyPayment({
      price: 2_500_000,
      downPaymentPercent: 20,
      interestRatePercent: 4.25,
      years: 25,
    })
    expect(totalInterest(monthly, 2_000_000, 25)).toBeCloseTo(monthly! * 300 - 2_000_000, 2)
    expect(totalInterest(null, 2_000_000, 25)).toBe(0)
    expect(totalInterest(0, 0, 25)).toBe(0)
  })

  it('maps the price slider on a log scale with round prices', () => {
    expect(priceToSlider(PRICE_SLIDER.min)).toBe(0)
    expect(priceToSlider(PRICE_SLIDER.max)).toBe(PRICE_SLIDER.steps)
    expect(priceToSlider(100)).toBe(0)
    expect(priceToSlider(1e9)).toBe(PRICE_SLIDER.steps)
    expect(sliderToPrice(0)).toBe(PRICE_SLIDER.min)
    expect(sliderToPrice(PRICE_SLIDER.steps)).toBe(PRICE_SLIDER.max)
    // Round trip lands near the typed price, on a round step
    const back = sliderToPrice(priceToSlider(2_500_000))
    expect(Math.abs(back - 2_500_000)).toBeLessThan(25_000)
    expect(back % 50_000).toBe(0)
    expect(sliderToPrice(priceToSlider(1_230_000)) % 10_000).toBe(0)
    // Monotonic
    let last = 0
    for (let p = 0; p <= PRICE_SLIDER.steps; p += 50) {
      const v = sliderToPrice(p)
      expect(v).toBeGreaterThanOrEqual(last)
      last = v
    }
  })
})

describe('rent vs buy guide (Plan your move)', () => {
  it('inverts the monthly payment', () => {
    const loan = 2_000_000
    const monthly = monthlyPayment({
      price: loan,
      downPaymentPercent: 0,
      interestRatePercent: 4.25,
      years: 25,
    })!
    expect(loanForPayment(monthly, 4.25, 25)).toBeCloseTo(loan, 0)
    expect(loanForPayment(1000, 0, 10)).toBe(120_000)
    expect(loanForPayment(0, 4.25, 25)).toBe(0)
    expect(loanForPayment(Number.NaN, 4.25, 25)).toBe(0)
  })

  it('prices a home whose payment matches the rent, with the right down payment', () => {
    const price = priceForPayment(10_000)
    expect(price).toBeLessThanOrEqual(5_000_000)
    const back = monthlyPayment({
      price,
      downPaymentPercent: defaultDownPayment(price),
      interestRatePercent: 4.25,
      years: 25,
    })!
    expect(back).toBeCloseTo(10_000, 0)
    const big = priceForPayment(40_000)
    expect(big).toBeGreaterThan(5_000_000)
    expect(
      monthlyPayment({ price: big, downPaymentPercent: 30, interestRatePercent: 4.25, years: 25 }),
    ).toBeCloseTo(40_000, 0)
    expect(priceForPayment(0)).toBe(0)
  })

  it('formats dirhams and maps a price to the Buy price filter', () => {
    expect(formatAed(2_500_000.4)).toBe('2,500,000')
    expect(formatAed(Number.NaN)).toBe('0')
    expect(buyBudgetFor(3_000_000)).toBe('UNDER_10M')
    expect(buyBudgetFor(12_000_000)).toBe('10M_15M')
    expect(buyBudgetFor(20_000_000)).toBe('OVER_15M')
  })
})
