import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

export const STORAGE_ROOT = path.resolve(process.cwd(), 'storage')
export const PUBLIC_DIR = path.join(STORAGE_ROOT, 'uploads', 'public')

/**
 * Resolve a relative path inside a root and reject traversal outside it.
 */
export function safeJoin(root: string, relativePath: string): string {
  const target = path.resolve(root, relativePath)
  if (target !== root && !target.startsWith(root + path.sep)) {
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
