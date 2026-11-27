import { expect, test } from '@playwright/test'

/**
 * Property page: price and every contact route near the top, the photo viewer, the facts,
 * the mortgage estimate that matches the calculator, the viewing form, and more listings.
 */
test.describe('property page', () => {
  test('price, contact, photos, details and viewing form', async ({ page }, info) => {
    await page.goto('/buy')
    const first = page.locator('.ll-pc').first()
    const title = (await first.locator('.ll-pc-title').innerText()).trim()
    await first.locator('a[href^="/properties/"]').first().click()
    await expect(page).toHaveURL(/\/properties\/[\w-]+$/)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()

    // Breadcrumb back to Buy
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(crumbs.getByRole('link', { name: 'Buy' })).toHaveAttribute('href', '/buy')

    // Price card: price, a viewing button and WhatsApp / Call / Email naming the listing
    const card = page.getByRole('complementary', { name: 'Price and contact' })
    await expect(card).toContainText('Guide asking price')
    await expect(card.getByRole('link', { name: 'Book a private viewing' })).toHaveAttribute(
      'href',
      '#viewing',
    )
    const contact = card.getByRole('group', { name: `Contact us about ${title}` })
    const whatsapp = contact.locator('a[href^="https://wa.me/"]')
    await expect(whatsapp).toHaveCount(1)
    expect(decodeURIComponent((await whatsapp.getAttribute('href')) ?? '')).toContain(title)
    await expect(contact.locator('a[href^="tel:"]')).toHaveCount(1)
    await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(1)

    // The price card is on screen without scrolling (desktop: beside the photos)
    if (info.project.name === 'desktop') await expect(card).toBeInViewport()

    // The monthly estimate in the card is the calculator's own starting figure
    const estimate = (await card.locator('.ll-pd-deal-est b').innerText()).trim()
    await expect(page.locator('#financing .ll-hmc-result-figure')).toContainText(estimate)

    // Photos open full screen; arrows move, Escape closes
    await page.locator('.ll-pd-gallery-tile button').first().click()
    const viewer = page.getByRole('dialog', { name: `${title} photos` })
    await expect(viewer).toBeVisible()
    const count = viewer.locator('.ll-pd-viewer-count')
    await expect(count).toHaveText(/^1 \/ \d+$/)
    await viewer.getByRole('button', { name: 'Next photo' }).click()
    await expect(count).toHaveText(/^2 \/ \d+$/)
    await page.keyboard.press('ArrowLeft')
    await expect(count).toHaveText(/^1 \/ \d+$/)
    await page.keyboard.press('Escape')
    await expect(viewer).toBeHidden()

    // Facts and details
    await expect(page.getByRole('list', { name: 'Key facts' })).toContainText('Built-up area')
    await expect(page.getByRole('heading', { name: 'Property details' })).toBeVisible()

    // The viewing button lands on the form, already about this listing
    await card.getByRole('link', { name: 'Book a private viewing' }).click()
    await expect(page).toHaveURL(/#viewing$/)
    const viewing = page.locator('#viewing')
    await expect(viewing).toBeInViewport()
    await expect(viewing.locator('.ll-form-context')).toContainText(title)
    await expect(viewing.getByRole('button', { name: /Request Private Viewing/ })).toBeVisible()

    // More listings of the same kind, without this one
    const more = page.locator('.ll-pd-more .ll-pc')
    await expect(more.first()).toBeVisible()
    await expect(page.locator('.ll-pd-more .ll-pc-title', { hasText: title })).toHaveCount(0)
  })

  test('phones keep a contact bar once the price card has scrolled away', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'phone', 'the bar is for phones and tablets')
    await page.goto('/rent')
    await page.locator('.ll-pc a[href^="/properties/"]').first().click()
    await expect(page).toHaveURL(/\/properties\/[\w-]+$/)

    const dock = page.locator('.ll-pd-dock')
    await expect(dock).not.toHaveClass(/is-shown/)
    await page.getByRole('heading', { name: 'Property details' }).scrollIntoViewIfNeeded()
    await expect(dock).toHaveClass(/is-shown/)
    await expect(dock).toContainText('per year')
    await expect(dock.locator('a[href^="https://wa.me/"]')).toHaveCount(1)
    await expect(dock.locator('a[href^="tel:"]')).toHaveCount(1)

    // It steps aside at the viewing form
    await page.locator('#viewing').scrollIntoViewIfNeeded()
    await expect(dock).not.toHaveClass(/is-shown/)
  })
})
