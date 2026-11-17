import { describe, expect, it } from 'vitest'
import { csvCell } from './csv'

describe('csvCell', () => {
  it('quotes values and doubles inner quotes', () => {
    expect(csvCell('Villa "A", Palm')).toBe('"Villa ""A"", Palm"')
  })

  it('writes empty cells for null / undefined and ISO dates', () => {
    expect(csvCell(null)).toBe('""')
    expect(csvCell(undefined)).toBe('""')
    expect(csvCell(new Date('2026-11-17T10:00:00Z'))).toBe('"2026-11-17T10:00:00.000Z"')
  })

  it('neutralises spreadsheet formulas (CSV injection)', () => {
    for (const evil of ['=HYPERLINK("x")', '+1+1', '-2+3', '@SUM(A1)']) {
      expect(csvCell(evil).startsWith(`"'`)).toBe(true)
    }
    expect(csvCell('+971 52 145 9888')).toBe(`"'+971 52 145 9888"`)
  })
})
