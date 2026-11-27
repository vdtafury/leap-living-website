import type { PixxiListingType, PixxiRawListing } from '../domain/pixxi'

const REQUEST_TIMEOUT_MS = 15_000

export interface PixxiPageResponse {
  list: PixxiRawListing[]
  totalSize: number
}

type FetchFn = typeof fetch

function parseErrorMessage(status: number, body: unknown): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    const msg = record.message ?? record.msg ?? record.error
    if (typeof msg === 'string' && msg.trim()) return `Pixxi API ${status}: ${msg.trim().slice(0, 300)}`
  }
  return `Pixxi API request failed with HTTP ${status}`
}

function checkPixxiEnvelope(status: number, body: unknown): void {
  if (status < 200 || status >= 300) throw new Error(parseErrorMessage(status, body))
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (typeof record.statusCode === 'number' && record.statusCode >= 400) {
      throw new Error(parseErrorMessage(record.statusCode, body))
    }
    if (record.status === false) {
      throw new Error(parseErrorMessage(status, body))
    }
  }
}

/**
 * Fetches one page of Website Listings (`SELL`, `RENT`, or `NEW` off-plan projects)
 * from POST /pixxiapi/v1/properties using X-PIXXI-TOKEN.
 */
export async function fetchPixxiListingsPage({
  apiToken,
  baseUrl,
  listingType,
  page,
  size = 50,
  fetchImpl = fetch,
}: {
  apiToken: string
  baseUrl: string
  listingType: PixxiListingType
  page: number
  size?: number
  fetchImpl?: FetchFn
}): Promise<PixxiPageResponse> {
  const response = await fetchImpl(`${baseUrl}/pixxiapi/v1/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-PIXXI-TOKEN': apiToken,
    },
    body: JSON.stringify({
      listingType,
      page,
      size,
      sortType: 'DESC',
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  const json: unknown = await response.json().catch(() => null)
  checkPixxiEnvelope(response.status, json)

  const record = (json && typeof json === 'object' ? json : {}) as Record<string, unknown>
  const container =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record
  const list = Array.isArray(container.list)
    ? (container.list as PixxiRawListing[])
    : Array.isArray(record.data)
      ? (record.data as PixxiRawListing[])
      : []
  const totalRaw = Number(container.totalSize ?? container.total ?? list.length)
  return {
    list,
    totalSize: Number.isFinite(totalRaw) ? totalRaw : list.length,
  }
}

/** Fetches a single listing by Pixxi propertyId via GET /pixxiapi/v1/{propertyId}. */
export async function fetchPixxiSingleListing({
  apiToken,
  baseUrl,
  propertyId,
  fetchImpl = fetch,
}: {
  apiToken: string
  baseUrl: string
  propertyId: string
  fetchImpl?: FetchFn
}): Promise<PixxiRawListing | null> {
  const response = await fetchImpl(
    `${baseUrl}/pixxiapi/v1/${encodeURIComponent(propertyId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-PIXXI-TOKEN': apiToken,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  )
  if (response.status === 404) return null
  const json: unknown = await response.json().catch(() => null)
  checkPixxiEnvelope(response.status, json)
  const record = (json && typeof json === 'object' ? json : {}) as Record<string, unknown>
  const item = record.data && typeof record.data === 'object' ? record.data : record
  return item as PixxiRawListing
}

/** Pushes one website lead form submission to POST /pixxiapi/webhook/v1/form. */
export async function submitPixxiLeadForm({
  apiToken,
  baseUrl,
  payload,
  fetchImpl = fetch,
}: {
  apiToken: string
  baseUrl: string
  payload: Record<string, unknown>
  fetchImpl?: FetchFn
}): Promise<void> {
  const response = await fetchImpl(`${baseUrl}/pixxiapi/webhook/v1/form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-PIXXI-TOKEN': apiToken,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  const json: unknown = await response.json().catch(() => null)
  checkPixxiEnvelope(response.status, json)
}
