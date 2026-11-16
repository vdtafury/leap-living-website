-- Initial SQLite schema for a fresh host database (mirrors prisma/schema.prisma).
-- Used by package-cpanel.sh to create leapliving-data/leapliving.db.
-- Keep in sync with the Prisma schema until real migrations are introduced.

CREATE TABLE IF NOT EXISTS "MediaAsset" (
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
);

CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_filename_key" ON "MediaAsset"("filename");
CREATE INDEX IF NOT EXISTS "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");
