import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { describe, expect, it } from 'vitest'
import { SCHEMA_STATEMENTS } from './schema'

const prismaSchema = fs.readFileSync(
  path.resolve(import.meta.dirname, '../../prisma/schema.prisma'),
  'utf8',
)

/** model name -> field names, parsed from prisma/schema.prisma */
function prismaModels(): Map<string, string[]> {
  const models = new Map<string, string[]>()
  for (const [, name, body] of prismaSchema.matchAll(/model (\w+) \{([\s\S]*?)\n\}/g)) {
    const fields = body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^\w+\s+\w/.test(line) && !line.startsWith('@@'))
      .map((line) => line.split(/\s+/)[0])
    models.set(name, fields)
  }
  return models
}

const EXPECTED_MODELS = [
  'AuditLog',
  'ContentDocument',
  'ContentRevision',
  'Customer',
  'CustomerInquiry',
  'CustomerSession',
  'CustomerToken',
  'Developer',
  'EmailOutbox',
  'Favorite',
  'Inquiry',
  'MediaAsset',
  'Permission',
  'PixxiLeadOutbox',
  'PixxiLink',
  'PixxiSyncRun',
  'Project',
  'Property',
  'Review',
  'Role',
  'RolePermission',
  'Session',
  'User',
  'UserRole',
]

describe('SQLite schema', () => {
  it('is idempotent: running it twice on the same database is fine', () => {
    const db = new Database(':memory:')
    for (let run = 0; run < 2; run++) for (const sql of SCHEMA_STATEMENTS) db.exec(sql)
    db.close()
  })

  it('has a table with exactly the columns of every Prisma model', () => {
    const db = new Database(':memory:')
    for (const sql of SCHEMA_STATEMENTS) db.exec(sql)
    const models = prismaModels()
    expect([...models.keys()].sort()).toEqual(EXPECTED_MODELS)
    for (const [model, fields] of models) {
      const columns = (db.prepare(`PRAGMA table_info("${model}")`).all() as { name: string }[]).map(
        (c) => c.name,
      )
      expect(columns.sort(), model).toEqual([...fields].sort())
    }
    db.close()
  })

  it('adds new tables to an existing database without touching its data', () => {
    const db = new Database(':memory:')
    db.exec(SCHEMA_STATEMENTS[0]) // an older database: MediaAsset only
    db.prepare(
      `INSERT INTO "MediaAsset" (id, filename, originalName, mimeType, size, path, updatedAt)
       VALUES ('1', 'a.jpg', 'a.jpg', 'image/jpeg', 1, 'p', CURRENT_TIMESTAMP)`,
    ).run()
    for (const sql of SCHEMA_STATEMENTS) db.exec(sql)
    expect(db.prepare('SELECT COUNT(*) AS n FROM "MediaAsset"').get()).toEqual({ n: 1 })
    expect(db.prepare('SELECT COUNT(*) AS n FROM "Inquiry"').get()).toEqual({ n: 0 })
    db.close()
  })
})
