import { ensureSchema, prisma } from './db'
// Composition root: the one place that imports module internals directly, because the
// modules' own entry points depend on ensureReady() (importing them here would be circular).
import { bootstrapAdmin, syncRbac } from '@/modules/users/application/bootstrap'
import { seedListings } from '@/modules/listings/application/seed'
import { seedDevelopers } from '@/modules/developers/application/seed'
import { seedContent } from '@/modules/content/application/seed'
import { startOutboxWorker } from '@/modules/inquiries/application/outbox'
import { recordAudit } from '@/modules/audit-logs'

type Env = Record<string, string | undefined>

/**
 * Starter content (D-31): on the very first start the current site (listings, projects,
 * developers, page text) is copied into the database, so the site looks the same and every
 * item is editable in /admin. Runs once per database: an audit entry marks it as done, so
 * deleting the starter items later never brings them back. SEED_STARTER_CONTENT=false skips it.
 */
export async function seedStarterContent(env: Env = process.env): Promise<boolean> {
  if (env.SEED_STARTER_CONTENT === 'false') return false
  if (await prisma.auditLog.findFirst({ where: { action: 'system.seeded' } })) return false
  await prisma.$transaction(async (tx) => {
    const listings = await seedListings(tx)
    const developers = await seedDevelopers(tx)
    const documents = await seedContent(tx)
    await recordAudit(
      { action: 'system.seeded', metadata: { ...listings, developers, documents } },
      tx,
    )
  })
  return true
}

let ready: Promise<void> | null = null

/**
 * Everything the app needs before its first query, once per process: tables, permissions and
 * shipped roles, the first Super Admin, the starter content, the email sender.
 */
export function ensureReady(): Promise<void> {
  ready ??= (async () => {
    await ensureSchema()
    await syncRbac()
    await bootstrapAdmin()
    await seedStarterContent()
    startOutboxWorker()
  })().catch((error) => {
    ready = null
    throw error
  })
  return ready
}
