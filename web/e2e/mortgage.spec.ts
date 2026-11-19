import { expect, test } from '@playwright/test'
import { openHome } from './helpers'

/** Homepage mortgage calculator (D-30, D-51): typed values and sliders drive one result panel. */
test.describe('mortgage calculator', () => {
  test('updates the result from typing and from the sliders', async ({ page }) => {
    await openHome(page)
    const calc = page.locator('#mortgage-calculator')
    await calc.scrollIntoViewIfNeeded()

    const figure = calc.locator('.ll-hmc-result-figure')
    // CMS defaults: AED 2.5M, 20% down, 4.25%, 25 years
    await expect(figure).toContainText('AED 10,835')
    await expect(calc.locator('.ll-hmc-rows')).toContainText('AED 2,000,000')
    await expect(calc.locator('.ll-hmc-hint')).toHaveText('AED 500,000')

    // Typing a price regroups the digits and updates the result and the down-payment amount
    const price = calc.getByLabel('Property price', { exact: true })
    await price.fill('3000000')
    await expect(price).toHaveValue('3,000,000')
    await expect(calc.locator('.ll-hmc-hint')).toHaveText('AED 600,000')
    await expect(calc.locator('.ll-hmc-rows')).toContainText('AED 2,400,000')

    // Moving the loan-period slider changes the monthly payment
    const before = await figure.textContent()
    const years = calc.getByLabel('Loan period slider')
    await years.focus()
    await page.keyboard.press('Home')
    await expect(calc.getByLabel('Loan period', { exact: true })).toHaveValue('1')
    await expect(figure).not.toHaveText(before ?? '')

    // One action in the panel: no duplicate apply link
    await expect(calc.getByRole('link')).toHaveCount(1)
    await expect(calc.getByRole('link')).toHaveAttribute('href', '/contact?topic=mortgage')
  })
})
