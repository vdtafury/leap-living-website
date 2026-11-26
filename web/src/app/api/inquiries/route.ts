import { NextResponse } from 'next/server'
import { createRateLimiter } from '@/server/rate-limit'
import { clientIp, hashIp, isSameOrigin } from '@/server/request'
import { guardApi } from '@/server/auth/api-guard'
import { originAllowed } from '@/server/auth/csrf'
import { customerFromRequest } from '@/server/auth/account'
import { fieldErrors, inquirySchema, MAX_INQUIRY_BYTES } from '@/lib/inquiry'
import { exportInquiries, submitInquiry } from '@/modules/inquiries'

// 5 submissions per visitor per 10 minutes: plenty for people, a brake for scripts.
const submissions = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

const json = (body: unknown, status: number, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers })

/** Reads a request body as UTF-8 while enforcing a hard byte cap (covers chunked transfers too). */
async function readBoundedText(request: Request, maxBytes: number): Promise<string | null> {
  if (!request.body) {
    const raw = await request.text()
    return Buffer.byteLength(raw, 'utf8') > maxBytes ? null : raw
  }
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined)
        return null
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  return Buffer.concat(chunks, total).toString('utf8')
}

/** Public: the site's consultation / valuation / viewing forms post here. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ ok: false, error: 'forbidden' }, 403)

  // Refuse malformed or oversized Content-Length before reading, then enforce the byte cap on stream.
  const contentLength = request.headers.get('content-length')
  if (contentLength !== null) {
    const parsedLength = Number(contentLength)
    if (!Number.isFinite(parsedLength) || parsedLength < 0) {
      return json({ ok: false, error: 'invalid content length' }, 400)
    }
    if (parsedLength > MAX_INQUIRY_BYTES) {
      return json({ ok: false, error: 'request too large' }, 413)
    }
  }
  const raw = await readBoundedText(request, MAX_INQUIRY_BYTES)
  if (raw === null) return json({ ok: false, error: 'request too large' }, 413)
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
    // Link to the visitor's account only for verified same-origin browser submissions.
    const customer = originAllowed(request.headers) ? await customerFromRequest(request) : null
    const inquiry = await submitInquiry(data, {
      ipHash: ip === 'unknown' ? null : hashIp(ip),
      userAgent: request.headers.get('user-agent'),
      customerId: customer?.id ?? null,
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
