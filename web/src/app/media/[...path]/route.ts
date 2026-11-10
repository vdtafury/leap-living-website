import { NextResponse } from 'next/server'
import { z } from 'zod'
import { readPublicFile } from '@/server/storage'
import { isAllowedImageType } from '@/lib/validation'

const EXTENSION_TO_TYPE: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const filenameSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/)

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params
  const filename = segments.join('/')
  const parsedName = filenameSchema.safeParse(filename)

  if (!parsedName.success) {
    return NextResponse.json({ ok: false, error: 'invalid file name' }, { status: 404 })
  }

  const extension = filename.toLowerCase().split('.').pop() ?? ''
  const contentType = EXTENSION_TO_TYPE[extension]

  if (!contentType || !isAllowedImageType(contentType)) {
    return NextResponse.json({ ok: false, error: 'unsupported file type' }, { status: 404 })
  }

  try {
    const buffer = await readPublicFile(filename)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
  }
}
