import { expect, test } from '@playwright/test'

/** Buy / Rent closing section (D-58): the estimator works and every tile leads somewhere. */

test('Buy: the estimator follows the price and the tiles link on', async ({ page }) => {
  await page.goto('/buy')
  const plan = page.locator('.ll-plan')
  await expect(plan.getByRole('heading', { name: 'Plan your purchase' })).toBeVisible()

  const readout = plan.locator('.ll-plan-readout-value')
  await expect(readout).toContainText('10,835')
  const range = plan.getByLabel('Property price')
  await range.focus()
  for (let i = 0; i < 40; i++) await page.keyboard.press('ArrowRight')
  await expect(readout).not.toContainText('10,835')
  await expect(plan.locator('.ll-plan-slider output')).not.toHaveText('AED 2,500,000')

  await expect(plan.getByRole('link', { name: /Open the full calculator/ })).toHaveAttribute(
    'href',
    '/#mortgage-calculator',
  )
  await expect(plan.locator('a.ll-plan-feature')).toHaveAttribute('href', '/projects')
  await expect(plan.getByRole('link', { name: /Book a consultation/ })).toHaveAttribute(
    'href',
    '/contact',
  )
  await expect(plan.getByRole('link', { name: 'Message us on WhatsApp' })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\//,
  )
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('Rent: the rent becomes a home price and links to homes for sale', async ({ page }) => {
  await page.goto('/rent')
  const plan = page.locator('.ll-plan')
  await expect(plan.getByRole('heading', { name: 'Plan your move' })).toBeVisible()

  const readout = plan.locator('.ll-plan-readout-value')
  const before = await readout.textContent()
  const range = plan.getByLabel('Annual rent')
  await range.focus()
  for (let i = 0; i < 300; i++) await page.keyboard.press('ArrowRight')
  await expect(readout).not.toHaveText(before ?? '')
  await expect(plan.getByRole('link', { name: /See homes for sale/ })).toHaveAttribute(
    'href',
    /^\/buy\?budget=(UNDER_10M|10M_15M|OVER_15M)$/,
  )
  await expect(plan.locator('a.ll-plan-feature')).toHaveAttribute('href', '/sell#list-with-us')
})
