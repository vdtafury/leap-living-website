import { NextResponse } from 'next/server'
import { guardApi } from '@/server/auth/api-guard'
import { uploadImage } from '@/modules/media'
import { MAX_UPLOAD_BYTES } from '@/lib/validation'

/** Admin image upload (signed in, `media.upload`, same origin, CSRF header). */
export async function POST(request: Request) {
  const guard = await guardApi(request, 'media.upload', { mutation: true })
  if (!guard.ok) return guard.response

  // Refuse big bodies before parsing them (multipart overhead allowed for).
  if (Number(request.headers.get('content-length') ?? 0) > MAX_UPLOAD_BYTES + 64 * 1024) {
    return NextResponse.json(
      { ok: false, error: 'The file exceeds the 5 MB limit.' },
      { status: 413 },
    )
  }
  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get('file')
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid upload.' }, { status: 400 })
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Choose a file.' }, { status: 400 })
  }
  const result = await uploadImage(guard.actor, {
    name: file.name,
    type: file.type,
    size: file.size,
    bytes: () => file.arrayBuffer(),
  })
  if (!result.ok)
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status })
  return NextResponse.json({ ok: true, asset: result.asset }, { status: 201 })
}
