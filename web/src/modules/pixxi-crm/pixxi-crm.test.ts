import { beforeAll, describe, expect, it, vi } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment()
})

import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { ForbiddenError } from '@/modules/authorization'
import { submitInquiry } from '@/modules/inquiries'
import {
  buildPixxiLeadPayload,
  getPixxiStatus,
  handlePixxiWebhookEvent,
  mapPixxiToProject,
  mapPixxiToProperty,
  nextPixxiRetryDelay,
  PIXXI_MAX_ATTEMPTS,
  processPixxiLeadOutbox,
  readPixxiConfig,
  resolvePixxiForm,
  retryPixxiLeads,
  syncPixxiCatalog,
} from '@/modules/pixxi-crm'
import { editor, superAdmin } from '@/test/actors'

const TEST_ENV = {
  PIXXI_API_TOKEN: 'test-pixxi-token',
  PIXXI_API_BASE_URL: 'https://dataapi.pixxicrm.ae',
  PIXXI_FORM_GENERAL_ID: 'form-gen-1',
  PIXXI_FORM_GENERAL_NAME: 'General Leads',
  PIXXI_FORM_LISTING_ID: 'form-list-1',
  PIXXI_FORM_LISTING_NAME: 'Listing Leads',
  PIXXI_FORM_SELL_ID: 'form-sell-1',
  PIXXI_FORM_SELL_NAME: 'Seller Leads',
  PIXXI_WEBHOOK_SECRET: 'wh-secret-123',
  PIXXI_HIDE_STARTER_ON_SYNC: 'true',
}

beforeAll(async () => {
  await ensureReady()
})

describe('pixxi domain helpers', () => {
  it('reads config and resolves form targets by intent and linked listing', () => {
    const cfg = readPixxiConfig(TEST_ENV)
    expect(cfg.enabled).toBe(true)
    expect(resolvePixxiForm('CONSULTATION', null, cfg).formId).toBe('form-gen-1')
    expect(resolvePixxiForm('LIST_PROPERTY', null, cfg).formId).toBe('form-sell-1')
    expect(resolvePixxiForm('VALUATION', null, cfg).formId).toBe('form-sell-1')
    expect(resolvePixxiForm('PROPERTY_INQUIRY', 'PX-1001', cfg).formId).toBe('form-list-1')

    const payload = buildPixxiLeadPayload(
      {
        id: 'inq-1',
        type: 'PROPERTY_INQUIRY',
        name: 'Amina Buyer',
        email: 'amina@example.com',
        phone: '+971 50 111 2222',
        interest: 'Palm Villa',
        notes: 'Viewing tomorrow',
        context: 'Palm Villa',
        pagePath: '/properties/palm-villa',
      },
      'PX-1001',
      cfg.forms.listing,
    )
    expect(payload).toMatchObject({
      formId: 'form-list-1',
      formName: 'Listing Leads',
      propertyReference: 'PX-1001',
      name: 'Amina Buyer',
      email: 'amina@example.com',
    })
    expect(payload.extraData).toMatchObject({
      inquiryType: 'PROPERTY_INQUIRY',
      sourceReference: 'inq-1',
    })

    // Quick "List With Us" has no email: omit `email` instead of sending an empty string.
    const quickSellerPayload = buildPixxiLeadPayload(
      {
        id: 'inq-2',
        type: 'LIST_PROPERTY',
        name: 'Omar Owner',
        email: '',
        phone: '+971 50 222 3333',
        interest: 'Dubai Hills',
        notes: '',
      },
      null,
      cfg.forms.sell,
    )
    expect(quickSellerPayload).not.toHaveProperty('email')
    expect(quickSellerPayload).not.toHaveProperty('propertyReference')
  })

  it('maps SELL, RENT and NEW listings cleanly and keeps incomplete listings as DRAFT', () => {
    const sale = mapPixxiToProperty(
      {
        id: 501,
        propertyId: 'LL-PX-501',
        listingType: 'SELL',
        title: 'Signature Palm Villa',
        description: '<p>Private beach villa.<br/>Panoramic sea views.</p>',
        price: 25000000,
        size: 8500,
        bedRooms: 6,
        bathrooms: 7,
        propertyType: 'VILLA',
        community: 'Palm Jumeirah',
        cityName: 'Dubai',
        photos: ['https://cdn.pixxicrm.ae/villa-1.jpg', 'javascript:alert(1)'],
        amenities: ['Private Pool', 'Beach Access'],
        sellParam: { completionStatus: 'COMPLETED' },
      },
      'SELL',
    )
    expect(sale).not.toBeNull()
    expect(sale).toMatchObject({
      transactionType: 'BUY',
      segment: 'RESIDENTIAL',
      propertyType: 'Villa',
      publicationStatus: 'PUBLISHED',
      beds: 6,
      baths: 7,
      price: '25000000',
    })
    expect(sale?.description).toBe('Private beach villa.\nPanoramic sea views.')
    expect(sale?.images).toHaveLength(1)

    const incomplete = mapPixxiToProperty(
      {
        id: 502,
        propertyId: 'LL-PX-502',
        listingType: 'RENT',
        title: 'Draft Office',
        propertyType: 'OFFICE',
        price: 0,
        photos: [],
      },
      'RENT',
    )
    expect(incomplete?.publicationStatus).toBe('DRAFT')
    expect(incomplete?.segment).toBe('COMMERCIAL')
    expect(incomplete?.propertyType).toBe('Commercial')

    const project = mapPixxiToProject({
      id: 701,
      propertyId: 'LL-PX-NEW-701',
      listingType: 'NEW',
      title: 'Creek Harbour Residences',
      developerName: 'Emaar',
      community: 'Dubai Creek Harbour',
      price: 2400000,
      description: 'Waterfront residences.',
      photos: ['https://cdn.pixxicrm.ae/creek.jpg'],
      propertyType: ['APARTMENT', 'PENTHOUSE'],
      newParam: {
        handoverTime: 'Q4 2028',
        paymentPlan: '80/20',
        bedroomMin: '1',
        bedroomMax: '4',
        minSize: 820,
        maxSize: 3100,
      },
    })
    expect(project).toMatchObject({
      publicationStatus: 'PUBLISHED',
      developer: 'Emaar',
      handoverLabel: 'Q4 2028',
      paymentPlan: '80/20',
      startingPrice: '2400000',
    })
  })
})

function mockPixxiFetch(catalog: {
  SELL: Record<string, unknown>[]
  RENT: Record<string, unknown>[]
  NEW: Record<string, unknown>[]
}): typeof fetch {
  return (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body ? (JSON.parse(String(init.body)) as { listingType?: string }) : {}
    const key = (body.listingType ?? 'SELL') as 'SELL' | 'RENT' | 'NEW'
    const list = catalog[key] ?? []
    return new Response(
      JSON.stringify({ statusCode: 200, data: { list, totalSize: list.length } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }) as typeof fetch
}

describe('pixxi catalog sync, lead outbox, webhooks and RBAC', () => {
  it('syncs SELL, RENT, NEW listings, skips unchanged, preserves featured, and archives removed items', async () => {
    const saleItem = {
      id: 101,
      propertyId: 'PX-SALE-101',
      listingType: 'SELL',
      title: 'Marina Penthouse',
      description: 'Full marina panorama.',
      price: 12000000,
      size: 4200,
      bedRooms: 4,
      bathrooms: 5,
      propertyType: 'PENTHOUSE',
      community: 'Dubai Marina',
      photos: ['https://cdn.pixxicrm.ae/p1.jpg'],
    }
    const rentItem = {
      id: 102,
      propertyId: 'PX-RENT-102',
      listingType: 'RENT',
      title: 'DIFC Sky Suite',
      description: 'Furnished residence in DIFC.',
      price: 380000,
      size: 1950,
      bedRooms: 2,
      bathrooms: 3,
      propertyType: 'APARTMENT',
      community: 'DIFC',
      photos: ['https://cdn.pixxicrm.ae/r1.jpg'],
      rentParam: { priceType: 'YEAR' },
    }
    const newItem = {
      id: 103,
      propertyId: 'PX-NEW-103',
      listingType: 'NEW',
      title: 'Palm West Tower',
      developerName: 'Omniyat',
      community: 'Palm Jumeirah',
      price: 6500000,
      description: 'Limited waterfront residences.',
      photos: ['https://cdn.pixxicrm.ae/n1.jpg'],
      newParam: { handoverTime: 'Q2 2029', paymentPlan: '60/40' },
    }

    const first = await syncPixxiCatalog({
      trigger: 'MANUAL',
      actor: superAdmin(),
      env: TEST_ENV,
      pageDelayMs: 0,
      fetchImpl: mockPixxiFetch({ SELL: [saleItem], RENT: [rentItem], NEW: [newItem] }),
    })
    expect(first).toEqual({ ok: true, fetched: 3, created: 3, updated: 0, archived: 0, errors: 0 })

    // Re-sync unchanged payload -> 0 created, 0 updated.
    const second = await syncPixxiCatalog({
      trigger: 'SCHEDULED',
      env: TEST_ENV,
      pageDelayMs: 0,
      fetchImpl: mockPixxiFetch({ SELL: [saleItem], RENT: [rentItem], NEW: [newItem] }),
    })
    expect(second).toEqual({ ok: true, fetched: 3, created: 0, updated: 0, archived: 0, errors: 0 })

    // Mark the synced sale property featured locally, then update price from Pixxi and remove rentItem.
    const saleLink = await prisma.pixxiLink.findUniqueOrThrow({
      where: { pixxiId: 'PX-SALE-101' },
    })
    await prisma.property.update({ where: { id: saleLink.entityId }, data: { featured: true } })

    const third = await syncPixxiCatalog({
      trigger: 'MANUAL',
      actor: superAdmin(),
      env: TEST_ENV,
      pageDelayMs: 0,
      fetchImpl: mockPixxiFetch({
        SELL: [{ ...saleItem, price: 12500000 }],
        RENT: [],
        NEW: [newItem],
      }),
    })
    expect(third).toEqual({ ok: true, fetched: 2, created: 0, updated: 1, archived: 1, errors: 0 })

    const updatedProp = await prisma.property.findUniqueOrThrow({ where: { id: saleLink.entityId } })
    expect(updatedProp.featured).toBe(true)
    expect(String(updatedProp.price)).toBe('12500000')

    const removedRentLink = await prisma.pixxiLink.findUniqueOrThrow({
      where: { pixxiId: 'PX-RENT-102' },
    })
    expect(removedRentLink.syncStatus).toBe('REMOVED')
  })

  it('queues inquiries for Pixxi with linked propertyId, sends once, and backs off on failure', async () => {
    const saleLink = await prisma.pixxiLink.findUniqueOrThrow({
      where: { pixxiId: 'PX-SALE-101' },
    })
    const { id } = await submitInquiry(
      {
        type: 'PROPERTY_INQUIRY',
        name: 'Tariq Investor',
        phone: '+971 50 333 4444',
        email: 'tariq@example.com',
        interest: 'Marina Penthouse',
        notes: 'Please send floorplan',
        listingType: 'PROPERTY',
        listingId: saleLink.entityId,
      },
      { ipHash: null, userAgent: 'vitest' },
    )

    const queued = await prisma.pixxiLeadOutbox.findUniqueOrThrow({ where: { inquiryId: id } })
    expect(queued.pixxiPropertyId).toBe('PX-SALE-101')
    expect(queued.status).toBe('PENDING')

    // Unconfigured env skips safely without losing the row.
    expect((await processPixxiLeadOutbox({ env: {} })).skipped).toBe(true)

    const sentPayloads: Record<string, unknown>[] = []
    const sent = await processPixxiLeadOutbox({
      env: TEST_ENV,
      send: async (payload) => {
        sentPayloads.push(payload)
      },
    })
    expect(sent).toEqual({ sent: 1, failed: 0, skipped: false })
    expect(sentPayloads[0]).toMatchObject({
      formId: 'form-list-1',
      propertyReference: 'PX-SALE-101',
      name: 'Tariq Investor',
    })

    // Failure retry backoff reaches FAILED after PIXXI_MAX_ATTEMPTS.
    const { id: failId } = await submitInquiry(
      {
        type: 'LIST_PROPERTY',
        name: 'Seller Lead',
        phone: '+971 50 777 8888',
        email: '',
        interest: 'Dubai Hills',
        notes: '',
      },
      { ipHash: null, userAgent: 'vitest' },
    )
    const failing = vi.fn().mockRejectedValue(new Error('Pixxi 503'))
    let clock = Date.now()
    for (let i = 0; i < PIXXI_MAX_ATTEMPTS; i++) {
      await processPixxiLeadOutbox({ env: TEST_ENV, send: failing, now: () => clock })
      clock += 7 * 60 * 60 * 1000
    }
    const failedRow = await prisma.pixxiLeadOutbox.findUniqueOrThrow({
      where: { inquiryId: failId },
    })
    expect(failedRow).toMatchObject({
      status: 'FAILED',
      attempts: PIXXI_MAX_ATTEMPTS,
      lastError: 'Pixxi 503',
    })
    expect(nextPixxiRetryDelay(1)).toBe(60_000)
    expect(nextPixxiRetryDelay(PIXXI_MAX_ATTEMPTS)).toBeNull()
  })

  it('verifies webhook secret and archives listings on DELETE_LISTINGS and EventDELETE_LISTINGS', async () => {
    const denied = await handlePixxiWebhookEvent({
      body: { event: 'EventDELETE_LISTINGS', data: { propertyId: 'PX-SALE-101' } },
      providedSecret: 'wrong-secret',
      env: TEST_ENV,
    })
    expect(denied).toEqual({ ok: false, status: 401, error: 'Unauthorized webhook.' })

    const accepted = await handlePixxiWebhookEvent({
      body: { event: 'DELETE_LISTINGS', data: { propertyReference: 'PX-SALE-101' } },
      providedSecret: 'wh-secret-123',
      env: TEST_ENV,
    })
    expect(accepted).toEqual({ ok: true, action: 'archived' })

    const link = await prisma.pixxiLink.findUniqueOrThrow({ where: { pixxiId: 'PX-SALE-101' } })
    expect(link.syncStatus).toBe('REMOVED')
  })

  it('enforces crm.view and crm.manage permissions', async () => {
    await expect(getPixxiStatus(editor(), TEST_ENV)).rejects.toBeInstanceOf(ForbiddenError)
    await expect(
      syncPixxiCatalog({ trigger: 'MANUAL', actor: editor(), env: TEST_ENV }),
    ).rejects.toBeInstanceOf(ForbiddenError)
    await expect(retryPixxiLeads(editor())).rejects.toBeInstanceOf(ForbiddenError)

    const status = await getPixxiStatus(superAdmin(), TEST_ENV)
    expect(status.config.tokenConfigured).toBe(true)
    expect(status.config.generalFormConfigured).toBe(true)
    expect(status.counts.activeProjects).toBe(1)
  })
})
