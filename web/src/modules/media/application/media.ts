import { randomUUID } from 'node:crypto'
import sharp, { type OutputInfo } from 'sharp'
import { unlink } from 'node:fs/promises'
import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { PUBLIC_DIR, safeJoin, savePublicFile } from '@/server/storage'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import { isAllowedImageType, MAX_UPLOAD_BYTES, sniffImageMime } from '@/lib/validation'

/** Images larger than this (in pixels) are refused before decoding: decompression bombs. */
export const MAX_INPUT_PIXELS = 50_000_000
export const MAIN_WIDTH = 1600
export const SMALL_WIDTH = 800

export type UploadResult =
  | { ok: true; asset: { id: string; url: string; width: number | null; height: number | null } }
  | { ok: false; status: number; error: string }

/**
 * Upload rules (SECURITY.md §6): size limit, declared type on the allow-list, real content
 * sniffed, then the image is DECODED AND RE-ENCODED to WebP with sharp. Re-encoding drops
 * metadata (GPS) and anything appended to the file (polyglots); the stored name is random,
 * the extension is ours, and the original name is kept only as data.
 */
export async function uploadImage(
  actor: Actor,
  file: { name: string; type: string; size: number; bytes: () => Promise<ArrayBuffer> },
): Promise<UploadResult> {
  authorize(actor, 'media.upload')
  if (file.size <= 0) return { ok: false, status: 400, error: 'The file is empty.' }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, status: 413, error: 'The file exceeds the 5 MB limit.' }
  }
  if (!isAllowedImageType(file.type)) {
    return { ok: false, status: 415, error: 'Use a JPEG, PNG or WebP image.' }
  }
  const buffer = Buffer.from(await file.bytes())
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return { ok: false, status: 413, error: 'The file exceeds the 5 MB limit.' }
  }
  if (sniffImageMime(buffer) !== file.type) {
    return { ok: false, status: 415, error: 'The file content does not match its type.' }
  }

  let main: { data: Buffer; info: OutputInfo }
  let small: Buffer
  try {
    const decode = () =>
      sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' }).rotate()
    main = await decode()
      .resize(MAIN_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true })
    small = await decode()
      .resize(SMALL_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
  } catch {
    return { ok: false, status: 415, error: 'The image could not be read.' }
  }

  await ensureReady()
  const id = randomUUID()
  const filename = `${id}.webp`
  const smallName = `${id}-${SMALL_WIDTH}.webp`
  let path: string
  try {
    path = await savePublicFile(filename, main.data)
    await savePublicFile(smallName, small)
  } catch (error) {
    await unlink(safeJoin(PUBLIC_DIR, filename)).catch(() => undefined)
    await unlink(safeJoin(PUBLIC_DIR, smallName)).catch(() => undefined)
    throw error
  }
  let asset
  try {
    asset = await prisma.$transaction(async (tx) => {
      const created = await tx.mediaAsset.create({
        data: {
          filename,
          originalName: file.name.replace(/[^\w .()-]/g, '_').slice(0, 200),
          mimeType: 'image/webp',
          size: main.data.length,
          width: main.info.width,
          height: main.info.height,
          path,
        },
      })
      await recordAudit(
        { actor, action: 'media.uploaded', targetType: 'MediaAsset', targetId: created.id },
        tx,
      )
      return created
    })
  } catch (error) {
    await unlink(safeJoin(PUBLIC_DIR, filename)).catch(() => undefined)
    await unlink(safeJoin(PUBLIC_DIR, smallName)).catch(() => undefined)
    throw error
  }
  return {
    ok: true,
    asset: { id: asset.id, url: `/media/${filename}`, width: asset.width, height: asset.height },
  }
}

export async function listMedia(actor: Actor) {
  authorize(actor, 'media.view')
  await ensureReady()
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 300 })
  return assets.map((a) => ({ ...a, url: `/media/${a.filename}` }))
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

/** Where an image is used (listings, projects, developers, CMS content). */
async function usages(tx: Tx, url: string) {
  const [properties, projects, developers, documents] = await Promise.all([
    tx.property.count({ where: { images: { contains: `"${url}"` } } }),
    tx.project.count({ where: { images: { contains: `"${url}"` } } }),
    tx.developer.count({ where: { logoUrl: url } }),
    tx.contentDocument.count({
      where: { OR: [{ draft: { contains: url } }, { published: { contains: url } }] },
    }),
  ])
  return properties + projects + developers + documents
}

export async function deleteMedia(actor: Actor, id: string) {
  authorize(actor, 'media.delete')
  await ensureReady()
  const outcome = await prisma.$transaction(async (tx) => {
    const asset = await tx.mediaAsset.findUnique({ where: { id } })
    if (!asset) return { ok: false as const, error: 'Not found.' }
    if ((await usages(tx, `/media/${asset.filename}`)) > 0) {
      return {
        ok: false as const,
        error: 'This image is still used; remove it from listings first.',
      }
    }
    await tx.mediaAsset.delete({ where: { id } })
    await recordAudit(
      { actor, action: 'media.deleted', targetType: 'MediaAsset', targetId: id },
      tx,
    )
    return { ok: true as const, filename: asset.filename }
  })
  if (!outcome.ok) return outcome
  const base = outcome.filename.replace(/\.webp$/, '')
  for (const name of [outcome.filename, `${base}-${SMALL_WIDTH}.webp`]) {
    await unlink(safeJoin(PUBLIC_DIR, name)).catch(() => undefined)
  }
  return { ok: true as const }
}
