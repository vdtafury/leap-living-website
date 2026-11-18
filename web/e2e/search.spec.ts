import { expect, test } from '@playwright/test'
import { openHome } from './helpers'

/** Hero search: buy / rent, the custom selects, and the results page it opens. */
test.describe('hero search', () => {
  test('searches villas for sale', async ({ page }) => {
    await openHome(page)
    const search = page.getByRole('search', { name: 'Property search' })

    // Rent and back to Buy (the toggle is a pressed button).
    await search.getByRole('button', { name: 'Rent', exact: true }).click()
    await expect(search.getByRole('button', { name: 'Rent', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await search.getByRole('button', { name: 'Buy', exact: true }).click()

    // Property type: listbox select, keyboard-friendly.
    await search.getByRole('button', { name: /Property type/ }).click()
    await page.getByRole('option', { name: 'Villa', exact: true }).click()
    await expect(search.getByRole('button', { name: /Property type/ })).toContainText('Villa')

    await search.getByRole('button', { name: 'Search' }).click()
    await expect(page).toHaveURL(/\/buy\?type=Villa$/)

    // Results: at least one card, and only villas.
    const cards = page.locator('.ll-pc')
    await expect(cards.first()).toBeVisible()
    const n = await cards.count()
    for (let i = 0; i < n; i++) await expect(cards.nth(i)).toContainText('Villa')
  })

  test('rent search goes to the rental listings', async ({ page }) => {
    await openHome(page)
    const search = page.getByRole('search', { name: 'Property search' })
    await search.getByRole('button', { name: 'Rent', exact: true }).click()
    await search.getByRole('button', { name: 'Search' }).click()
    await expect(page).toHaveURL(/\/rent$/)
    await expect(page.locator('.ll-pc').first()).toBeVisible()
  })
})
