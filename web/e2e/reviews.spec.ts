import { expect, test } from '@playwright/test'
import { isPhone, openHome } from './helpers'

/** Review wall (D-44, D-49): the first six, then "Show more reviews". */
test('review wall shows the first reviews and more on request', async ({ page }, info) => {
  await openHome(page)
  const wall = page.locator('.ll-reviews')
  await wall.scrollIntoViewIfNeeded()
  const cards = wall.locator('.ll-rw-card')
  const inPage = await cards.count()
  expect(inPage).toBeGreaterThan(0)
  expect(inPage, 'at most six reviews in the page at first').toBeLessThanOrEqual(6)

  const more = wall.getByRole('button', { name: 'Show more reviews' })
  if (isPhone(info.project.name) && inPage > 3) {
    await expect(wall.locator('.ll-rw-card:visible')).toHaveCount(3)
    await more.click()
    await expect(wall.locator('.ll-rw-card:visible')).toHaveCount(inPage)
  } else {
    await expect(wall.locator('.ll-rw-card:visible')).toHaveCount(inPage)
  }
  // Only signed-in accounts write reviews: the button goes to the review page (sign-in first).
  await wall.getByRole('link', { name: 'Share your experience' }).click()
  await expect(page).toHaveURL(
    /\/account\/sign-in\?next=%2Faccount%2Freview|\/account\/sign-in\?next=\/account\/review/,
  )
})
