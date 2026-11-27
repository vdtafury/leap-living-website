import 'dotenv/config'
import { PrismaClient } from '../../generated/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { SCHEMA_STATEMENTS } from './schema'

const url = process.env.DATABASE_URL || 'file:./storage/dev.db'

const globalForPrisma = globalThis as typeof globalThis & { __llPrisma?: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url })
  return new PrismaClient({ adapter })
}

export const prisma =
  process.env.NODE_ENV === 'development'
    ? (globalForPrisma.__llPrisma ??= createPrismaClient())
    : createPrismaClient()

let schemaReady: Promise<void> | null = null

/**
 * Creates any missing tables, once per process. Call it before the first query of a request
 * handler. It is cheap (idempotent CREATE ... IF NOT EXISTS, run once) and makes new tables
 * appear on existing databases without a manual migration step.
 */
export function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    // Enable WAL mode and a busy timeout so concurrent readers/writers on SQLite do not hit SQLITE_BUSY.
    await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL')
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 5000')
    for (const statement of SCHEMA_STATEMENTS) await prisma.$executeRawUnsafe(statement)
  })().catch((error) => {
    schemaReady = null // retry on the next request (e.g. the disk was briefly unavailable)
    throw error
  })
  return schemaReady
}
