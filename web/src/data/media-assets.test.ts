import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import manifest from './image-manifest.json'
import { PROJECTS, PROPERTIES } from './catalog'

const PUBLIC = path.resolve(import.meta.dirname, '../../public')
const IMAGES = path.join(PUBLIC, 'images')
const isPhoto = (f: string) => /\.(jpe?g|png)$/i.test(f)
const sha1 = (file: string) => createHash('sha1').update(fs.readFileSync(file)).digest('hex')

describe('public photos', () => {
  it('has no byte-identical copies (a copy usually means one photo overwrote another)', () => {
    const seen = new Map<string, string>()
    const duplicates: string[] = []
    for (const file of fs.readdirSync(IMAGES).filter(isPhoto)) {
      const hash = sha1(path.join(IMAGES, file))
      const first = seen.get(hash)
      if (first) duplicates.push(`${file} = ${first}`)
      else seen.set(hash, file)
    }
    expect(duplicates).toEqual([])
  })

  it('has a manifest entry for every photo and every listed variant exists', () => {
    const entries = manifest as Record<
      string,
      { variants: { src: string }[]; portrait?: { src: string } }
    >
    const missing: string[] = []
    for (const file of fs.readdirSync(IMAGES).filter(isPhoto)) {
      if (!entries[`/images/${file}`]) missing.push(`manifest: /images/${file}`)
    }
    for (const [src, entry] of Object.entries(entries)) {
      for (const v of [...entry.variants, ...(entry.portrait ? [entry.portrait] : [])]) {
        if (!fs.existsSync(path.join(PUBLIC, v.src))) missing.push(`${src} -> ${v.src}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('serves every catalogue image from public/images', () => {
    const used = [...PROPERTIES, ...PROJECTS].flatMap((item) => [item.heroImage, ...item.gallery])
    const missing = [...new Set(used)].filter((src) => !fs.existsSync(path.join(PUBLIC, src)))
    expect(missing).toEqual([])
  })
})
