import { defineConfig, devices } from '@playwright/test'

/**
 * Browser tests (D-49): the homepage carousel, the hero search, customer accounts and the
 * review wall, on a desktop and a phone screen. CI runs them on every pull request against a
 * production build with a throwaway database (.github/workflows/ci.yml).
 *
 *   npm run build && npm run test:e2e           starts its own server on :3200
 *   E2E_BASE_URL=http://127.0.0.1:3101 npm run test:e2e   uses a server that is already running
 *
 * Never point E2E_BASE_URL at a real site: the account test signs up a new account.
 */
const PORT = 3200
const external = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: external ?? `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    // Local runs without Playwright's own browser can point at any Chromium.
    launchOptions: process.env.E2E_CHROMIUM_PATH
      ? { executablePath: process.env.E2E_CHROMIUM_PATH }
      : {},
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: external
    ? undefined
    : {
        // SQLite creates the file but not its folder.
        command: `mkdir -p storage/e2e && npx next start -H 127.0.0.1 -p ${PORT}`,
        url: `http://127.0.0.1:${PORT}`,
        timeout: 120_000,
        reuseExistingServer: false,
        // Throwaway test database and uploads folder (git-ignored), with the starter content.
        env: {
          DATABASE_URL: 'file:./storage/e2e/e2e.db',
          STORAGE_DIR: './storage/e2e',
          ADMIN_USER: 'e2eadmin',
          ADMIN_PASSWORD: 'e2e-initial-password-1',
        },
      },
})
