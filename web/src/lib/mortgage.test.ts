import { describe, expect, it } from 'vitest'
import { formatAmountInput, loanAmount, monthlyPayment, parseAmount } from './mortgage'

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
    expect(monthlyPayment({ ...base, downPaymentPercent: 120 })).toBeNull()
    expect(monthlyPayment({ ...base, interestRatePercent: -1 })).toBeNull()
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
})
