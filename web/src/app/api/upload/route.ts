import { NextResponse } from 'next/server'
import { guardApi } from '@/server/auth/api-guard'
import { uploadImage } from '@/modules/media'
import { MAX_UPLOAD_BYTES } from '@/lib/validation'

const NO_STORE = { 'Cache-Control': 'no-store' }

/** Admin image upload (signed in, `media.upload`, same origin, CSRF header). */
export async function POST(request: Request) {
  const guard = await guardApi(request, 'media.upload', { mutation: true })
  if (!guard.ok) return guard.response

  // Refuse malformed or oversized bodies before parsing them (multipart overhead allowed for).
  const contentLength = request.headers.get('content-length')
  if (contentLength !== null) {
    const parsedLength = Number(contentLength)
    if (!Number.isFinite(parsedLength) || parsedLength < 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid upload.' },
        { status: 400, headers: NO_STORE },
      )
    }
    if (parsedLength > MAX_UPLOAD_BYTES + 64 * 1024) {
      return NextResponse.json(
        { ok: false, error: 'The file exceeds the 5 MB limit.' },
        { status: 413, headers: NO_STORE },
      )
    }
  }
  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get('file')
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid upload.' },
      { status: 400, headers: NO_STORE },
    )
  }
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: 'Choose a file.' },
      { status: 400, headers: NO_STORE },
    )
  }
  try {
    const result = await uploadImage(guard.actor, {
      name: file.name,
      type: file.type,
      size: file.size,
      bytes: () => file.arrayBuffer(),
    })
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status, headers: NO_STORE },
      )
    }
    return NextResponse.json({ ok: true, asset: result.asset }, { status: 201, headers: NO_STORE })
  } catch (error) {
    console.error('[upload] failed', error)
    return NextResponse.json(
      { ok: false, error: 'Could not save the image. Please try again.' },
      { status: 500, headers: NO_STORE },
    )
  }
}
