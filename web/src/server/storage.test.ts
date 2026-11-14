import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { safeJoin } from './storage'

describe('safeJoin', () => {
  const root = path.resolve('/srv/storage/uploads/public')

  it('resolves plain file names inside the root', () => {
    expect(safeJoin(root, 'photo.jpg')).toBe(path.join(root, 'photo.jpg'))
  })

  it('rejects path traversal outside the root', () => {
    expect(() => safeJoin(root, '../private/secret.pdf')).toThrow('Path traversal detected')
    expect(() => safeJoin(root, '/etc/passwd')).toThrow('Path traversal detected')
    expect(() => safeJoin(root, '../public-evil/x.jpg')).toThrow('Path traversal detected')
  })
})
