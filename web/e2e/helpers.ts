import type { Page } from '@playwright/test'

/**
 * Lower homepage sections render lazily (content-visibility); the page transition also fades
 * content in. Both are visual only, but switching them off keeps the tests fast and stable.
 */
export async function openHome(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    document.documentElement.classList.add('ll-render-all')
    document.documentElement.style.scrollBehavior = 'auto'
  })
}

export const isPhone = (projectName: string) => projectName === 'phone'
