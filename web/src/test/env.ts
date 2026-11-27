import { mkdtempSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * Points the app at a fresh SQLite file and storage folder. Call it inside vi.hoisted() so it
 * runs before '@/server/db' is imported (imports are hoisted above normal statements).
 */
export function useTestEnvironment(extra: Record<string, string> = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'leap-test-'))
  Object.assign(process.env, {
    DATABASE_URL: `file:${path.join(dir, 'test.db')}`,
    STORAGE_DIR: path.join(dir, 'storage'),
    ADMIN_USER: 'founder',
    ADMIN_PASSWORD: 'initial-admin-password-1',
    IP_HASH_SECRET: 'test-secret',
    SMTP_HOST: '',
    MAIL_FROM: '',
    MAIL_TO: '',
    PIXXI_API_TOKEN: '',
    PIXXI_FORM_GENERAL_ID: '',
    PIXXI_FORM_LISTING_ID: '',
    PIXXI_WEBHOOK_SECRET: '',
    ...extra,
  })
  return dir
}
