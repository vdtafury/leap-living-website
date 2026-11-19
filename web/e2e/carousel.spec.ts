import { expect, test } from '@playwright/test'
import { isPhone, openHome } from './helpers'

/** Homepage featured properties (D-46, D-47, D-50): more than three, and easy to move through. */
test.describe('property carousel', () => {
  test('shows there are more properties and moves through them', async ({ page }, info) => {
    await openHome(page)
    const carousel = page.locator('[aria-roledescription="carousel"]').first()
    await carousel.scrollIntoViewIfNeeded()

    const slides = carousel.locator('[aria-roledescription="slide"]')
    const count = await slides.count()
    expect(count, 'more than three featured properties').toBeGreaterThan(3)

    // No segment bar or counter under the cards (D-50).
    await expect(carousel.locator('.ll-carousel-foot')).toHaveCount(0)

    const next = carousel.locator('.ll-carousel-edge--next')
    const prev = carousel.locator('.ll-carousel-edge--prev')
    if (isPhone(info.project.name)) {
      // Phones: no edge tabs; the next card peeks in and the row swipes.
      await expect(next).toBeHidden()
      const track = carousel.locator('.ll-carousel-track')
      await track.evaluate((t) => t.scrollBy({ left: t.clientWidth, behavior: 'instant' }))
      await expect.poll(() => track.evaluate((t) => t.scrollLeft)).toBeGreaterThan(0)
    } else {
      // Desktop: the tab over the peeking card says how many are left, and moves on.
      await expect(next).toHaveAttribute('data-show', 'true')
      await expect(next).toContainText(/\d+ more/)
      await expect(prev).toHaveAttribute('data-show', 'false')
      await next.click()
      await expect(prev).toHaveAttribute('data-show', 'true')
      await expect(prev).toContainText(/\d+ back/)
      await prev.click()
      await expect(prev).toHaveAttribute('data-show', 'false')
    }

    // Every card opens its property page and offers WhatsApp, call and email.
    const card = slides.last()
    await expect(card.locator('a[href^="https://wa.me/"]')).toHaveCount(1)
    await expect(card.locator('a[href^="tel:"]')).toHaveCount(1)
    await expect(card.locator('a[href^="mailto:"]')).toHaveCount(1)
    const href = await card.locator('a[href^="/properties/"]').first().getAttribute('href')
    expect(href).toMatch(/^\/properties\/[\w-]+$/)
  })
})
