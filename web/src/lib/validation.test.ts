import { describe, expect, it } from 'vitest'
import { isAllowedImageType, sniffImageMime } from './validation'

describe('sniffImageMime', () => {
  it('detects JPEG, PNG and WebP by magic bytes', () => {
    expect(sniffImageMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
    expect(
      sniffImageMime(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])),
    ).toBe('image/png')
    expect(sniffImageMime(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'ascii'))).toBe('image/webp')
  })

  it('rejects non-image content even when it is named like an image', () => {
    expect(sniffImageMime(Buffer.from('hello not an image'))).toBeNull()
    expect(sniffImageMime(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull()
    expect(sniffImageMime(Buffer.alloc(0))).toBeNull()
  })
})

describe('isAllowedImageType', () => {
  it('allows only the supported raster types', () => {
    expect(isAllowedImageType('image/jpeg')).toBe(true)
    expect(isAllowedImageType('image/svg+xml')).toBe(false)
    expect(isAllowedImageType('toString')).toBe(false)
  })
})
