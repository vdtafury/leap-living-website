import { NextResponse } from 'next/server'
import { createRateLimiter } from '@/server/rate-limit'
import { clientIp, hashIp, isSameOrigin } from '@/server/request'
import { guardApi } from '@/server/auth/api-guard'
import { fieldErrors, inquirySchema, MAX_INQUIRY_BYTES } from '@/lib/inquiry'
import { exportInquiries, submitInquiry } from '@/modules/inquiries'

// 5 submissions per visitor per 10 minutes: plenty for people, a brake for scripts.
const submissions = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

const json = (body: unknown, status: number, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers })

/** Public: the site's consultation / valuation / viewing forms post here. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ ok: false, error: 'forbidden' }, 403)

  // Refuse big bodies before reading them into memory (the header is checked, then the text).
  if (Number(request.headers.get('content-length') ?? 0) > MAX_INQUIRY_BYTES) {
    return json({ ok: false, error: 'request too large' }, 413)
  }
  const raw = await request.text()
  if (raw.length > MAX_INQUIRY_BYTES) return json({ ok: false, error: 'request too large' }, 413)
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ ok: false, error: 'invalid JSON' }, 400)
  }

  const parsed = inquirySchema.safeParse(body)
  if (!parsed.success) {
    return json({ ok: false, error: 'invalid fields', fields: fieldErrors(parsed.error) }, 400)
  }
  const { website, ...data } = parsed.data
  // Honeypot filled: a bot. Answer like a success so it does not adapt, but store nothing.
  if (website) return json({ ok: true }, 201)

  // Counted only for requests that would be saved: typos and rejected posts cost nothing.
  const ip = clientIp(request)
  const limit = submissions.hit(ip)
  if (!limit.ok) {
    return json(
      { ok: false, error: 'Too many requests. Please try again in a few minutes, or call us.' },
      429,
      { 'Retry-After': String(limit.retryAfter) },
    )
  }

  try {
    // Saved together with its notification email (outbox); sending happens afterwards.
    const inquiry = await submitInquiry(data, {
      ipHash: ip === 'unknown' ? null : hashIp(ip),
      userAgent: request.headers.get('user-agent'),
    })
    return json({ ok: true, id: inquiry.id }, 201)
  } catch (error) {
    console.error('[inquiries] save failed', error)
    return json({ ok: false, error: 'Could not send right now. Please call or email us.' }, 500)
  }
}

/** Admin (signed in, `inquiry.export`): all requests as JSON, or `?format=csv` for Excel. */
export async function GET(request: Request) {
  const guard = await guardApi(request, 'inquiry.export')
  if (!guard.ok) return guard.response

  const format = new URL(request.url).searchParams.get('format') === 'csv' ? 'csv' : 'json'
  const result = await exportInquiries(guard.actor, format)
  if (result.csv !== undefined) {
    return new NextResponse(result.csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leapliving-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  }
  return json({ ok: true, count: result.rows.length, inquiries: result.rows }, 200, {
    'Cache-Control': 'no-store',
  })
}
