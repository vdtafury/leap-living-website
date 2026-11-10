import { NextResponse } from 'next/server'
import { getImageMetadata, resizeImage } from '@/server/images'
import { MAX_UPLOAD_BYTES, sniffImageMime } from '@/lib/validation'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'file field is required' }, { status: 400 })
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: 'file exceeds the 5 MB limit' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!sniffImageMime(buffer)) {
    return NextResponse.json({ ok: false, error: 'file is not a supported image' }, { status: 415 })
  }

  const resized = await resizeImage(buffer, 320)
  const metadata = await getImageMetadata(resized)

  return new NextResponse(new Uint8Array(resized), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(resized.length),
      'X-Image-Width': String(metadata.width ?? ''),
      'X-Image-Height': String(metadata.height ?? ''),
    },
  })
}
