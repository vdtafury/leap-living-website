import { describe, expect, it } from 'vitest'
import { fieldErrors, inquirySchema } from './inquiry'

const valid = {
  type: 'VALUATION',
  name: 'Aisha Rahman',
  phone: '+971 52 145 9888',
  email: 'aisha@example.com',
  interest: 'Palm Jumeirah villa',
}

describe('inquirySchema', () => {
  it('accepts a complete request and trims the fields', () => {
    const parsed = inquirySchema.parse({ ...valid, name: '  Aisha Rahman  ', notes: '  soon ' })
    expect(parsed.name).toBe('Aisha Rahman')
    expect(parsed.notes).toBe('soon')
  })

  it('defaults notes to an empty string', () => {
    expect(inquirySchema.parse(valid).notes).toBe('')
  })

  it('accepts Arabic names', () => {
    expect(inquirySchema.safeParse({ ...valid, name: 'محمد أحمد' }).success).toBe(true)
  })

  it('rejects unknown types', () => {
    expect(inquirySchema.safeParse({ ...valid, type: 'SPAM' }).success).toBe(false)
  })

  it('reports one readable message per invalid field', () => {
    const result = inquirySchema.safeParse({ ...valid, email: 'not-an-email', phone: 'call me' })
    expect(result.success).toBe(false)
    const errors = fieldErrors(result.error!)
    expect(errors.email).toBe('Please enter a valid email address')
    expect(errors.phone).toBe('Please enter a valid phone number')
    expect(errors.name).toBeUndefined()
  })

  it('caps field lengths', () => {
    expect(inquirySchema.safeParse({ ...valid, notes: 'x'.repeat(2001) }).success).toBe(false)
    expect(inquirySchema.safeParse({ ...valid, name: 'x'.repeat(121) }).success).toBe(false)
  })
})
