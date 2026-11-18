import 'dotenv/config'
import { PrismaClient } from '../../generated/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { SCHEMA_STATEMENTS } from './schema'

// On Vercel Serverless (Lambda), only /tmp is writable.
const url = process.env.VERCEL
  ? 'file:/tmp/leap_dev.db'
  : (process.env.DATABASE_URL || 'file:./storage/dev.db')

const adapter = new PrismaBetterSqlite3({ url })

export const prisma = new PrismaClient({ adapter })

let schemaReady: Promise<void> | null = null

/**
 * Creates any missing tables, once per process. Call it before the first query of a request
 * handler. It is cheap (idempotent CREATE ... IF NOT EXISTS, run once) and makes new tables
 * appear on existing databases without a manual migration step.
 */
export function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    for (const statement of SCHEMA_STATEMENTS) await prisma.$executeRawUnsafe(statement)
  })().catch((error) => {
    schemaReady = null // retry on the next request (e.g. the disk was briefly unavailable)
    throw error
  })
  return schemaReady
}
