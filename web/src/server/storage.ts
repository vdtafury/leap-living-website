import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

// On the host, STORAGE_DIR points outside the release folder so uploads survive redeploys.
export const STORAGE_ROOT = path.resolve(
  /*turbopackIgnore: true*/ process.env.STORAGE_DIR || path.join(process.cwd(), 'storage'),
)
export const PUBLIC_DIR = path.join(STORAGE_ROOT, 'uploads', 'public')

/**
 * Resolve a relative path inside a root and reject traversal outside it.
 */
export function safeJoin(root: string, relativePath: string): string {
  const base = path.resolve(root)
  const target = path.resolve(base, relativePath)
  if (target !== base && !target.startsWith(base + path.sep)) {
    throw new Error('Path traversal detected')
  }
  return target
}

export async function savePublicFile(filename: string, data: Buffer): Promise<string> {
  await mkdir(PUBLIC_DIR, { recursive: true })
  const target = safeJoin(PUBLIC_DIR, filename)
  await writeFile(target, data)
  return target
}

export async function readPublicFile(filename: string): Promise<Buffer> {
  const target = safeJoin(PUBLIC_DIR, filename)
  return readFile(target)
}
