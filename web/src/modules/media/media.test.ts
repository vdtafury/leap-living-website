import { beforeAll, describe, expect, it, vi } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment()
})

import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { ensureReady } from '@/server/bootstrap'
import { PUBLIC_DIR, safeJoin } from '@/server/storage'
import { ForbiddenError } from '@/modules/authorization'
import { deleteMedia, uploadImage } from '@/modules/media'
import { editor, nobody, superAdmin } from '@/test/actors'

const fileOf = (bytes: Buffer, type: string, name = 'photo.png') => ({
  name,
  type,
  size: bytes.length,
  bytes: async () => new Uint8Array(bytes).buffer,
})

let png: Buffer
beforeAll(async () => {
  await ensureReady()
  png = await sharp({ create: { width: 1200, height: 800, channels: 3, background: '#3B9EA1' } })
    .png()
    .toBuffer()
})

describe('upload abuse is rejected', () => {
  it('requires the upload permission', async () => {
    await expect(uploadImage(nobody(), fileOf(png, 'image/png'))).rejects.toBeInstanceOf(
      ForbiddenError,
    )
  })

  it('refuses wrong types, spoofed types, oversize files and undecodable images', async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    )
    expect(await uploadImage(editor(), fileOf(svg, 'image/svg+xml', 'x.svg'))).toMatchObject({
      ok: false,
      status: 415,
    })
    expect(await uploadImage(editor(), fileOf(svg, 'image/png', 'x.png'))).toMatchObject({
      ok: false,
      status: 415,
    })
    const big = Buffer.alloc(6 * 1024 * 1024)
    expect(await uploadImage(editor(), fileOf(big, 'image/png'))).toMatchObject({
      ok: false,
      status: 413,
    })
    const fakeJpeg = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      Buffer.from('not really an image'),
    ])
    expect(await uploadImage(editor(), fileOf(fakeJpeg, 'image/jpeg', 'x.jpg'))).toMatchObject({
      ok: false,
      status: 415,
    })
  })

  it('re-encodes to WebP with a random name, dropping anything appended (polyglot)', async () => {
    const polyglot = Buffer.concat([png, Buffer.from('<html><script>alert(1)</script></html>')])
    const result = await uploadImage(editor(), fileOf(polyglot, 'image/png', '../../evil.html.png'))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.asset.url).toMatch(/^\/media\/[0-9a-f-]{36}\.webp$/)
    const stored = await readFile(safeJoin(PUBLIC_DIR, result.asset.url.replace('/media/', '')))
    expect(stored.toString('latin1')).not.toContain('<script>')
    expect((await sharp(stored).metadata()).format).toBe('webp')
    expect(result.asset.width).toBe(1200)
    // An Editor may not delete; a Super Admin may (the file is unused).
    await expect(deleteMedia(editor(), result.asset.id)).rejects.toBeInstanceOf(ForbiddenError)
    expect((await deleteMedia(superAdmin(), result.asset.id)).ok).toBe(true)
  })
})
