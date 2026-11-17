/**
 * SQLite schema, mirroring prisma/schema.prisma. Every statement is idempotent
 * (IF NOT EXISTS), so `ensureSchema()` creates a fresh database and adds new tables to an
 * existing one (a developer's dev.db, the staging/production file) without a manual step.
 *
 * Keep it in sync with prisma/schema.prisma (src/server/schema.test.ts checks every model
 * has a table). Only additive changes are safe here; anything else needs a real migration.
 */
export const SCHEMA_STATEMENTS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "path" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_filename_key" ON "MediaAsset"("filename")`,
  `CREATE INDEX IF NOT EXISTS "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt")`,
  `CREATE TABLE IF NOT EXISTS "Inquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "context" TEXT,
    "pagePath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "Inquiry_createdAt_idx" ON "Inquiry"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Inquiry_type_createdAt_idx" ON "Inquiry"("type", "createdAt")`,
]
