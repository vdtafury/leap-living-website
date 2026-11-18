import { expect, test } from '@playwright/test'
import { isPhone, openHome } from './helpers'

/** Homepage featured properties (D-46, D-47): more than three, and easy to move through. */
test.describe('property carousel', () => {
  test('shows there are more properties and moves through them', async ({ page }, info) => {
    await openHome(page)
    const carousel = page.locator('[aria-roledescription="carousel"]').first()
    await carousel.scrollIntoViewIfNeeded()

    const slides = carousel.locator('[aria-roledescription="slide"]')
    const count = await slides.count()
    expect(count, 'more than three featured properties').toBeGreaterThan(3)

    const segments = carousel.getByRole('group', { name: /^Go to a / }).getByRole('button')
    await expect(segments).toHaveCount(count)
    await expect(segments.first()).toHaveAttribute('aria-current', 'true')
    await expect(carousel.locator('.ll-carousel-count')).toContainText(`of ${count}`)

    if (isPhone(info.project.name)) {
      // Phones: no edge tabs; swipe or tap a segment.
      await expect(carousel.locator('.ll-carousel-edge--next')).toBeHidden()
    } else {
      // Desktop: the tab over the peeking card says how many are left, and moves on.
      const next = carousel.locator('.ll-carousel-edge--next')
      await expect(next).toBeVisible()
      await expect(next).toContainText(/\d+ more/)
      await next.click()
      await expect(segments.first()).not.toHaveAttribute('aria-current', 'true')
      const prev = carousel.locator('.ll-carousel-edge--prev')
      await expect(prev).toBeVisible()
      await prev.click()
      await expect(segments.first()).toHaveAttribute('aria-current', 'true')
    }

    // A segment jumps straight to its property.
    await segments.last().click()
    await expect(segments.last()).toHaveAttribute('aria-current', 'true')
    await expect(carousel.locator('.ll-carousel-count')).toContainText(`${count} of ${count}`)

    // Every card opens its property page and offers WhatsApp, call and email.
    const card = slides.last()
    await expect(card.locator('a[href^="https://wa.me/"]')).toHaveCount(1)
    await expect(card.locator('a[href^="tel:"]')).toHaveCount(1)
    await expect(card.locator('a[href^="mailto:"]')).toHaveCount(1)
    const href = await card.locator('a[href^="/properties/"]').first().getAttribute('href')
    expect(href).toMatch(/^\/properties\/[\w-]+$/)
  })
})
