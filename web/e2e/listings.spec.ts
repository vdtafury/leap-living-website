import { expect, test } from '@playwright/test'

/** Buy page: live filters kept in the URL, removable chips, sorting, the brief tile. */
test.describe('buy listings', () => {
  test('filters, chips and sorting', async ({ page }) => {
    await page.goto('/buy')
    const bar = page.getByRole('search', { name: 'Filter properties' })
    const cards = page.locator('.ll-pc')
    await expect(cards.first()).toBeVisible()
    const total = await cards.count()

    // Filter by type: the list, the URL and a chip all follow.
    await bar.getByRole('button', { name: /Property type/ }).click()
    await page.getByRole('option', { name: 'Villa', exact: true }).click()
    await expect(page).toHaveURL(/\/buy\?type=Villa$/)
    const villas = await cards.count()
    expect(villas).toBeLessThan(total)
    for (let i = 0; i < villas; i++) await expect(cards.nth(i)).toContainText('Villa')
    await expect(
      page.getByRole('heading', { level: 2, name: `${villas} properties for sale` }),
    ).toBeVisible()

    // Removing the chip clears the filter.
    await page.getByRole('list', { name: 'Active filters' }).getByRole('button').click()
    await expect(page).toHaveURL(/\/buy$/)
    await expect(cards).toHaveCount(total)

    // Sort by price, high to low.
    await page.getByRole('button', { name: /Sort by/ }).click()
    await page.getByRole('option', { name: 'Price: high to low' }).click()
    await expect(page).toHaveURL(/sort=PRICE_DESC/)
    const prices = await page
      .locator('.ll-pc-price')
      .evaluateAll((els) => els.map((el) => Number(el.textContent!.replace(/[^\d]/g, ''))))
    expect(prices).toEqual([...prices].sort((a, b) => b - a))

    // The grid ends with the brief tile.
    await expect(
      page.getByRole('complementary', { name: /Can’t find the right home/ }),
    ).toBeVisible()
  })

  test('opens with the filters from the URL and shows an empty state', async ({ page }) => {
    await page.goto('/buy?type=Penthouse&beds=5&budget=UNDER_10M')
    await expect(
      page.getByRole('heading', { name: 'No properties match these filters' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Show all properties' }).click()
    await expect(page).toHaveURL(/\/buy$/)
    await expect(page.locator('.ll-pc').first()).toBeVisible()
  })
})
