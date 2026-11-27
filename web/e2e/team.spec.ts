import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { isPhone } from './helpers'

/**
 * About → Meet the Team (D-57): nothing shows until a person is published from the admin;
 * then the card, the "Read bio" profile and the #team anchor work.
 * Uses the throwaway e2e database and the env Super Admin (playwright.config.ts).
 */
const ADMIN = 'e2eadmin'
const FIRST_PASSWORD = 'e2e-initial-password-1'
const OWN_PASSWORD = 'e2e-own-password-for-the-team-test'
const PERSON = 'Playwright Teammate'

async function signInAsAdmin(page: Page) {
  for (const password of [FIRST_PASSWORD, OWN_PASSWORD]) {
    await page.goto('/account/sign-in')
    await page.getByLabel('Email or username').fill(ADMIN)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    // Either the admin opens, or the form says the password is wrong (a retry after the
    // password was already changed).
    const wrong = page.getByRole('alert').filter({ hasText: 'Wrong username or password' })
    await expect(async () => {
      expect(page.url().includes('/admin') || (await wrong.isVisible())).toBe(true)
    }).toPass({ timeout: 15_000 })
    if (page.url().includes('/admin')) break
  }
  if (page.url().includes('/admin/change-password')) {
    await page.locator('input[name="current"]').fill(FIRST_PASSWORD)
    await page.locator('input[name="next"]').fill(OWN_PASSWORD)
    await page.locator('input[name="confirm"]').fill(OWN_PASSWORD)
    await page.getByRole('button', { name: 'Change password' }).click()
    await page.waitForURL((url) => !url.pathname.includes('change-password'))
  }
  await expect(page).toHaveURL(/\/admin/)
}

test('the team section appears only once people are published, with a bio profile', async ({
  page,
}, testInfo) => {
  test.skip(isPhone(testInfo.project.name), 'Publishing runs once, on the desktop project.')
  test.setTimeout(90_000)

  // Starter content has no people: no section, no anchor, no placeholder faces.
  await page.goto('/about')
  if (!(await page.getByText(PERSON).count())) {
    await expect(page.locator('#team')).toHaveCount(0)
  }

  await signInAsAdmin(page)
  await page.goto('/admin/content/about')
  await page.locator('summary', { hasText: 'Meet the Team' }).click()
  await page.getByRole('button', { name: 'Add person' }).click()
  const person = page.locator('.adm-group', { hasText: /^Person \d+/ }).last()
  await person.getByLabel('Full name').fill(PERSON)
  await person.getByLabel('Job title').fill('Property Consultant')
  await person
    .getByLabel('Biography')
    .fill('First paragraph of the biography.\nSecond paragraph, only in the profile.')
  await person
    .locator('input[type="file"]')
    .setInputFiles(path.join(process.cwd(), 'public/images/architecture-glass-towers.jpg'))
  await expect(person.locator('img.adm-image-pick-preview')).toHaveAttribute(
    'src',
    /^\/media\/.+\.webp$/,
  )
  await page.getByRole('button', { name: 'Save draft' }).click()
  await expect(
    page.getByText('The draft has changes that are not on the website yet.'),
  ).toBeVisible()

  // Draft only: the public page is unchanged until Publish.
  await page.goto('/about')
  await expect(page.getByRole('heading', { name: PERSON })).toHaveCount(0)

  await page.goto('/admin/content/about')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Publish', exact: true }).click()
  await expect(page.getByText('Published: the site shows this version now.')).toBeVisible()

  await page.goto('/about#team')
  const section = page.locator('#team')
  await expect(section.getByRole('heading', { name: 'Meet the Team' })).toBeVisible()
  const card = section.locator('.ll-team-card', { hasText: PERSON }).first()
  await expect(card.getByText('Property Consultant')).toBeVisible()
  await expect(card.locator('img')).toHaveAttribute('srcset', /-800\.webp 800w/)

  await card.getByRole('button', { name: /Read bio/ }).click()
  const profile = page.getByRole('dialog', { name: PERSON })
  await expect(profile).toBeVisible()
  await expect(profile.getByText('Second paragraph, only in the profile.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(profile).toBeHidden()
})

test('the team cards fit the screen', async ({ page }, testInfo) => {
  await page.goto('/about')
  const section = page.locator('#team')
  test.skip((await section.count()) === 0, 'No team published in this database yet.')
  await section.scrollIntoViewIfNeeded()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
  const columns = await section
    .locator('.ll-team-grid')
    .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length)
  if (isPhone(testInfo.project.name)) expect(columns).toBe(2)
  else expect(columns).toBeGreaterThanOrEqual(1)
})
