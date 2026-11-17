import { NextResponse } from 'next/server'
import { ensureSchema, prisma } from '@/server/db'
import { checkAdmin } from '@/server/admin-auth'
import { createRateLimiter } from '@/server/rate-limit'
import { clientIp, hashIp, isSameOrigin } from '@/server/request'
import { fieldErrors, inquirySchema, MAX_INQUIRY_BYTES } from '@/lib/inquiry'
import { csvCell } from '@/lib/csv'

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
    await ensureSchema()
    const inquiry = await prisma.inquiry.create({
      data: {
        ...data,
        context: data.context || null,
        pagePath: data.pagePath || null,
        ipHash: ip === 'unknown' ? null : hashIp(ip),
        userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
      },
      select: { id: true },
    })
    // CRM hand-off goes here once the CRM is chosen (the row is already saved either way).
    return json({ ok: true, id: inquiry.id }, 201)
  } catch (error) {
    console.error('[inquiries] save failed', error)
    return json({ ok: false, error: 'Could not send right now. Please call or email us.' }, 500)
  }
}

const CSV_COLUMNS = [
  'createdAt',
  'type',
  'status',
  'name',
  'phone',
  'email',
  'interest',
  'context',
  'notes',
  'pagePath',
] as const

/** Admin only: the latest inquiries as JSON, or `?format=csv` for Excel. */
export async function GET(request: Request) {
  const auth = checkAdmin(request)
  if (!auth.ok) return auth.response

  await ensureSchema()
  const rows = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 })

  if (new URL(request.url).searchParams.get('format') === 'csv') {
    const lines = [
      CSV_COLUMNS.join(','),
      ...rows.map((row) => CSV_COLUMNS.map((c) => csvCell(row[c])).join(',')),
    ]
    // BOM so Excel opens UTF-8 (Arabic names) correctly.
    return new NextResponse(`\uFEFF${lines.join('\r\n')}\r\n`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leapliving-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  }
  return json({ ok: true, count: rows.length, inquiries: rows }, 200, {
    'Cache-Control': 'no-store',
  })
}
