import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createRateLimiter } from '@/server/rate-limit'
import { clientIp } from '@/server/request'
import { handlePixxiWebhookEvent } from '@/modules/pixxi-crm'

const MAX_WEBHOOK_BYTES = 256 * 1024
const webhookLimit = createRateLimiter({ limit: 120, windowMs: 60 * 1000 })

const json = (body: unknown, status: number, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

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

/**
 * Incoming Pixxi CRM listing webhooks (EventADD_LISTINGS, EventUPDATE_LISTINGS, EventDELETE_LISTINGS).
 * Authenticated via PIXXI_WEBHOOK_SECRET in the `x-pixxi-webhook-secret` header or `?secret=` query param.
 */
export async function POST(request: Request) {
  const ip = clientIp(request)
  const limit = webhookLimit.hit(ip)
  if (!limit.ok) {
    return json({ ok: false, error: 'Rate limit exceeded' }, 429, {
      'Retry-After': String(limit.retryAfter),
    })
  }

  const contentLength = request.headers.get('content-length')
  if (contentLength !== null) {
    const parsedLength = Number(contentLength)
    if (!Number.isFinite(parsedLength) || parsedLength < 0) {
      return json({ ok: false, error: 'Invalid content length' }, 400)
    }
    if (parsedLength > MAX_WEBHOOK_BYTES) {
      return json({ ok: false, error: 'Payload too large' }, 413)
    }
  }

  const raw = await readBoundedText(request, MAX_WEBHOOK_BYTES)
  if (raw === null) return json({ ok: false, error: 'Payload too large' }, 413)

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400)
  }

  const providedSecret =
    request.headers.get('x-pixxi-webhook-secret') ??
    new URL(request.url).searchParams.get('secret')

  const result = await handlePixxiWebhookEvent({ body, providedSecret })
  if (!result.ok) {
    return json({ ok: false, error: result.error }, result.status)
  }
  if (result.action === 'created' || result.action === 'updated' || result.action === 'archived') {
    revalidatePath('/')
    revalidatePath('/buy')
    revalidatePath('/rent')
    revalidatePath('/projects')
  }
  return json({ ok: true, action: result.action }, 200)
}
