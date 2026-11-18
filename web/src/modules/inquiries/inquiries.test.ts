import { beforeAll, describe, expect, it, vi } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment({ MAIL_TO: 'team@example.com' })
})

import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { ForbiddenError } from '@/modules/authorization'
import {
  exportInquiries,
  listInquiries,
  MAX_ATTEMPTS,
  nextAttemptDelay,
  notificationEmail,
  processOutbox,
  smtpConfigured,
  submitInquiry,
} from '@/modules/inquiries'
import { editor, superAdmin } from '@/test/actors'

const sample = {
  type: 'VALUATION' as const,
  name: 'Sara Test',
  phone: '+971 50 000 0000',
  email: 'sara@example.com',
  interest: 'Villa in Arabian Ranches',
  notes: 'Call after 5pm',
}
const meta = { ipHash: null, userAgent: 'vitest' }

beforeAll(async () => {
  await ensureReady()
})

describe('persist first, then notify', () => {
  it('saves the request and queues its email in one go, with no SMTP configured', async () => {
    expect(smtpConfigured()).toBe(false)
    const { id } = await submitInquiry(sample, meta)
    const inquiry = await prisma.inquiry.findUniqueOrThrow({ where: { id } })
    expect(inquiry.status).toBe('NEW')
    const email = await prisma.emailOutbox.findFirstOrThrow({ where: { relatedId: id } })
    expect(email).toMatchObject({ status: 'PENDING', to: 'team@example.com', attempts: 0 })
    expect(email.text).toContain('Email: sara@example.com')
    // Nothing is sent without SMTP: the email waits in the queue.
    expect((await processOutbox()).skipped).toBe(true)
  })

  it('keeps line breaks out of the subject', () => {
    const { subject } = notificationEmail({ ...sample, name: 'Eve\r\nBcc: x@evil.test', id: '1' })
    expect(subject).not.toMatch(/[\r\n]/)
  })
})

describe('outbox sender', () => {
  it('sends due emails once and marks them SENT', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    const result = await processOutbox({ send })
    expect(result.sent).toBe(1)
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ replyTo: 'sara@example.com' }))
    expect(await prisma.emailOutbox.count({ where: { status: 'SENT' } })).toBe(1)
    // Second run: nothing left to send
    expect((await processOutbox({ send })).sent).toBe(0)
  })

  it('backs off after a failure and gives up after the last attempt', async () => {
    await submitInquiry({ ...sample, name: 'Retry Case' }, meta)
    const failing = vi.fn().mockRejectedValue(new Error('SMTP down'))
    let clock = Date.now()
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await processOutbox({ send: failing, now: () => clock })
      clock += 7 * 60 * 60 * 1000 // past the longest delay
    }
    const row = await prisma.emailOutbox.findFirstOrThrow({
      where: { text: { contains: 'Retry Case' } },
    })
    expect(row).toMatchObject({ status: 'FAILED', attempts: MAX_ATTEMPTS, lastError: 'SMTP down' })
    expect(failing).toHaveBeenCalledTimes(MAX_ATTEMPTS)
    expect(nextAttemptDelay(1)).toBe(60_000)
    expect(nextAttemptDelay(MAX_ATTEMPTS)).toBeNull()
  })
})

describe('reading submissions needs permission', () => {
  it('Editors cannot read or export personal data', async () => {
    await expect(listInquiries(editor(), {})).rejects.toBeInstanceOf(ForbiddenError)
    await expect(exportInquiries(editor(), 'csv')).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('exports are audited', async () => {
    const result = await exportInquiries(superAdmin(), 'csv')
    expect(result.csv?.startsWith('\uFEFFcreatedAt,')).toBe(true)
    expect(await prisma.auditLog.count({ where: { action: 'inquiry.exported' } })).toBe(1)
  })
})
