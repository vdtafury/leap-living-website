import { expect, test } from '@playwright/test'

/**
 * Customer accounts (D-40): save a property while signed out, create the account on the way,
 * find it in My account, sign out, a wrong password, sign back in. Desktop only: sign-ups are
 * rate-limited per IP, and the flow is the same on a phone.
 */
test('save a property, create an account, sign out and back in', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'one account per run')
  const email = `e2e-${Date.now()}@example.test`
  const password = 'e2e-password-12345'

  // Signed out, the heart leads to sign-in and remembers the property.
  await page.goto('/buy')
  const card = page.locator('.ll-pc').first()
  const title = (await card.locator('.ll-pc-title').innerText()).trim()
  await card.getByRole('button', { name: `Save ${title}` }).click()
  await expect(page).toHaveURL(/\/account\/sign-in\?/)

  // No account yet: create one from there.
  await page.getByRole('link', { name: 'Create a free account' }).click()
  await expect(page).toHaveURL(/\/account\/sign-up/)
  await page.getByLabel('Full name').fill('Playwright Tester')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  // Back where they were, with the property saved.
  await expect(page).toHaveURL(/\/buy/)
  await expect(
    page
      .locator('.ll-pc')
      .first()
      .getByRole('button', { name: `Remove ${title} from saved` }),
  ).toBeVisible()

  // My account lists it.
  await page.goto('/account')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hello, Playwright')
  const saved = page.locator('#saved-properties')
  await expect(saved.locator('.ll-acc-count')).toHaveText('1')
  await expect(saved).toContainText(title)

  // Sign out, then a wrong password is refused.
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.goto('/account/sign-in')
  await page.getByLabel('Email or username').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('not-the-right-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator('.ll-acc-alert--error')).toBeVisible()

  // The right one works, and the saved property is still there.
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.locator('#saved-properties .ll-acc-count')).toHaveText('1')
})
