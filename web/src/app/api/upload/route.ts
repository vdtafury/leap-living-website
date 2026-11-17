import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { checkAdmin } from '@/server/admin-auth'
import { z } from 'zod'
import { ensureSchema, prisma } from '@/server/db'
import { savePublicFile } from '@/server/storage'
import { getImageMetadata } from '@/server/images'
import {
  ALLOWED_IMAGE_TYPES,
  isAllowedImageType,
  MAX_UPLOAD_BYTES,
  sniffImageMime,
} from '@/lib/validation'

const uploadSchema = z.object({
  file: z.instanceof(File),
})

export async function POST(request: Request) {
  // Admin only (HTTP Basic, ADMIN_USER / ADMIN_PASSWORD); switched off when those are unset.
  const auth = checkAdmin(request)
  if (!auth.ok) return auth.response

  const formData = await request.formData()
  const parsed = uploadSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'file field is required' }, { status: 400 })
  }

  const file = parsed.data.file

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: 'file exceeds the 5 MB limit' }, { status: 413 })
  }
  if (!isAllowedImageType(file.type)) {
    return NextResponse.json({ ok: false, error: 'unsupported file type' }, { status: 415 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const sniffed = sniffImageMime(buffer)
  if (sniffed !== file.type) {
    return NextResponse.json(
      { ok: false, error: 'file content does not match its declared type' },
      { status: 415 },
    )
  }

  const extension = path.extname(file.name).toLowerCase() || ALLOWED_IMAGE_TYPES[file.type][0]
  const filename = `${randomUUID()}${extension}`
  const storagePath = await savePublicFile(filename, buffer)
  const metadata = await getImageMetadata(buffer)

  await ensureSchema()
  const asset = await prisma.mediaAsset.create({
    data: {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      width: metadata.width,
      height: metadata.height,
      path: storagePath,
    },
  })

  return NextResponse.json({ ok: true, asset }, { status: 201 })
}
