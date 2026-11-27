import { expect, test, type Page } from '@playwright/test'

/**
 * Sell page: the quick "List With Us" form in the header, and the briefing form that opens on
 * Private Consultation (client) unless the visitor came for a Free Valuation.
 */
const tab = (page: Page, name: string) => page.locator('#valuation-form').getByRole('tab', { name })

test.describe('sell page', () => {
  test('opens on Private Consultation; valuation links open the valuation tab', async ({
    page,
  }, info) => {
    await page.goto('/sell')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Free Valuation')

    // The quick owner form is in the header, on screen without scrolling.
    const list = page.locator('#list-with-us')
    await expect(list.getByRole('heading', { name: 'List With Us' })).toBeInViewport()
    await expect(list.getByRole('button', { name: 'List With Us' })).toBeVisible()

    // Private Consultation first, and selected on a plain visit.
    const tabs = page.locator('#valuation-form').getByRole('tab')
    await expect(tabs.first()).toHaveText('Private Consultation')
    await expect(tab(page, 'Private Consultation')).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('button', { name: /Schedule Private Consultation/ })).toBeVisible()

    // The link under the quick form asks for a valuation.
    await page.getByRole('link', { name: 'Request a Free Property Valuation' }).click()
    await expect(page).toHaveURL(/#valuation-form$/)
    await expect(tab(page, 'Free Property Valuation')).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('button', { name: /Submit Valuation Request/ })).toBeVisible()

    // The visitor can still switch; the valuation link reopens the valuation tab.
    await tab(page, 'Private Consultation').click()
    await expect(tab(page, 'Private Consultation')).toHaveAttribute('aria-selected', 'true')
    await page.getByRole('link', { name: 'Request a Free Property Valuation' }).click()
    await expect(tab(page, 'Free Property Valuation')).toHaveAttribute('aria-selected', 'true')

    // From another page, the header's Free Valuation button lands on the valuation tab.
    if (info.project.name === 'desktop') {
      await page.goto('/buy')
      await page
        .getByRole('banner')
        .getByRole('link', { name: /Free Valuation/ })
        .click()
      await expect(page).toHaveURL(/\/sell#valuation-form$/)
      await expect(tab(page, 'Free Property Valuation')).toHaveAttribute('aria-selected', 'true')
    } else {
      await page.goto('/buy')
      await page.goto('/sell#valuation-form')
      await expect(tab(page, 'Free Property Valuation')).toHaveAttribute('aria-selected', 'true')
    }
  })

  test('contact page: consultation by default, valuation when asked', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByRole('tab', { name: 'Private Consultation' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await page.goto('/contact?topic=valuation')
    await expect(page.getByRole('tab', { name: 'Free Property Valuation' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
  test('pill fields, and the two side-by-side panels match in size', async ({ page }, info) => {
    const box = async (selector: string) => {
      const b = await page.locator(selector).first().boundingBox()
      if (!b) throw new Error(`no box for ${selector}`)
      return b
    }

    await page.goto('/sell')
    // Every single-line field on the page is a pill (D-60).
    const radii = await page
      .locator('.ll-sell-hero input.ll-input, .ll-sell-brief input.ll-input')
      .evaluateAll((inputs) => inputs.map((el) => parseFloat(getComputedStyle(el).borderRadius)))
    expect(radii.length).toBeGreaterThanOrEqual(7)
    for (const r of radii) expect(r).toBeGreaterThanOrEqual(24)

    if (info.project.name !== 'desktop') return

    const near = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(2)
    const details = await box('.ll-sell-brief-panel')
    const form = await box('.ll-sell-brief-form .ll-form-card')
    near(details.width, form.width)
    near(details.height, form.height)
    near(details.y, form.y)

    await page.goto('/contact')
    const channels = await box('.ll-contact-card')
    const briefing = await box('.ll-contact-form .ll-form-card')
    near(channels.width, briefing.width)
    near(channels.height, briefing.height)
    near(channels.y, briefing.y)
  })
})
