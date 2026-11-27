/**
 * Mortgage maths shared by the homepage calculator and the property-page calculator.
 * Standard annuity formula: M = L * r(1+r)^n / ((1+r)^n - 1), with r the monthly rate.
 */

export interface MortgageInput {
  /** Property price in AED */
  price: number
  /** Down payment, percent of the price (0-100) */
  downPaymentPercent: number
  /** Annual interest rate, percent (e.g. 4.25) */
  interestRatePercent: number
  /** Loan period in years */
  years: number
}

/** UAE lenders cap residential mortgage terms at 25 years. */
export const MAX_LOAN_YEARS = 25

/** Starting values of the calculator (the property page quotes the same estimate). */
export const DEFAULT_INTEREST_RATE = 4.25
export const DEFAULT_LOAN_YEARS = 25

/** UAE LTV rule of thumb: 20% down up to AED 5M, 30% above (the lender decides). */
export function defaultDownPayment(price: number): number {
  return price > 5_000_000 ? 30 : 20
}

export function loanAmount(price: number, downPaymentPercent: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0
  const pct = Math.min(
    100,
    Math.max(0, Number.isFinite(downPaymentPercent) ? downPaymentPercent : 0),
  )
  return price * (1 - pct / 100)
}

/** Monthly principal-and-interest payment, or null when the input cannot be priced. */
export function monthlyPayment(input: MortgageInput): number | null {
  const { price, downPaymentPercent, interestRatePercent, years } = input
  if (![price, downPaymentPercent, interestRatePercent, years].every(Number.isFinite)) return null
  if (price <= 0 || years <= 0 || interestRatePercent < 0) return null
  if (downPaymentPercent < 0 || downPaymentPercent > 100) return null

  const principal = loanAmount(price, downPaymentPercent)
  if (principal === 0) return 0

  const months = Math.round(years * 12)
  if (months <= 0) return null
  const r = interestRatePercent / 100 / 12
  if (r === 0) return principal / months
  const factor = Math.pow(1 + r, months)
  if (!Number.isFinite(factor) || factor <= 1) return null
  const payment = (principal * r * factor) / (factor - 1)
  return Number.isFinite(payment) ? payment : null
}

/** Parses user input such as "2,500,000" or " 4.25 " into a number (NaN when empty/invalid). */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/[,\s]/g, '')
  if (cleaned === '' || !/^\d*\.?\d*$/.test(cleaned)) return Number.NaN
  return Number(cleaned)
}

/** "2500000" -> "2,500,000" while typing; keeps a trailing decimal part as typed. */
export function formatAmountInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '')
  const [int, ...rest] = cleaned.split('.')
  const grouped = int.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return rest.length ? `${grouped}.${rest.join('').slice(0, 2)}` : grouped
}

/** Total interest over the loan for a monthly payment (0 when the loan cannot be priced). */
export function totalInterest(monthly: number | null, loan: number, years: number): number {
  if (monthly === null || !Number.isFinite(monthly) || !Number.isFinite(years) || years <= 0) {
    return 0
  }
  return Math.max(0, monthly * Math.round(years * 12) - loan)
}

/**
 * Price slider on a logarithmic scale (AED 500k to 50M), so the common range gets most of the
 * track, as on the big portals. Positions run 0 to PRICE_SLIDER_STEPS.
 */
export const PRICE_SLIDER = { min: 500_000, max: 50_000_000, steps: 1000 } as const

export function priceToSlider(price: number): number {
  const { min, max, steps } = PRICE_SLIDER
  if (!Number.isFinite(price) || price <= min) return 0
  if (price >= max) return steps
  return Math.round((Math.log(price / min) / Math.log(max / min)) * steps)
}

/** Slider position to a round price: AED 10k steps under 2M, 50k under 10M, 100k above. */
export function sliderToPrice(position: number): number {
  const { min, max, steps } = PRICE_SLIDER
  const p = Math.min(steps, Math.max(0, position))
  const raw = min * Math.exp((p / steps) * Math.log(max / min))
  const step = raw < 2_000_000 ? 10_000 : raw < 10_000_000 ? 50_000 : 100_000
  return Math.min(max, Math.max(min, Math.round(raw / step) * step))
}

/** Loan a monthly payment can carry (inverse of the annuity formula). */
export function loanForPayment(
  monthly: number,
  interestRatePercent: number,
  years: number,
): number {
  if (![monthly, interestRatePercent, years].every(Number.isFinite)) return 0
  if (monthly <= 0 || years <= 0 || interestRatePercent < 0) return 0
  const months = Math.round(years * 12)
  const r = interestRatePercent / 100 / 12
  if (r === 0) return monthly * months
  const factor = Math.pow(1 + r, months)
  return (monthly * (factor - 1)) / (r * factor)
}

/**
 * Rough price of a home whose mortgage payment equals `monthly`, with the default down payment
 * for that price (20% up to AED 5M, 30% above). Used by the Rent page's "rent vs buy" guide.
 */
export function priceForPayment(
  monthly: number,
  interestRatePercent = DEFAULT_INTEREST_RATE,
  years = DEFAULT_LOAN_YEARS,
): number {
  const loan = loanForPayment(monthly, interestRatePercent, years)
  if (loan <= 0) return 0
  const at20 = loan / 0.8
  return at20 <= 5_000_000 ? at20 : loan / 0.7
}

/** Dubai Land Department transfer fee: 4% of the price (admin fees on top). */
export const DLD_FEE_PERCENT = 4

/** "2500000" -> "2,500,000" (whole dirhams; same output on the server and in the browser). */
export function formatAed(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** The Buy list's price filter that contains `price` (values of the /buy ?budget= filter). */
export function buyBudgetFor(price: number): 'UNDER_10M' | '10M_15M' | 'OVER_15M' {
  if (price <= 10_000_000) return 'UNDER_10M'
  if (price <= 15_000_000) return '10M_15M'
  return 'OVER_15M'
}
