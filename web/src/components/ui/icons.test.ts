import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Icon sprite (D-49): every icon in icons.tsx is a <use href="#ll-i-…"> pointing at a symbol
 * drawn once per page from icon-glyphs.tsx. A missing symbol would render as nothing, so the
 * two lists must match. (Read as text: the glyph file is TSX and vitest runs .ts in node.)
 */
const read = (name: string) => fs.readFileSync(path.join(import.meta.dirname, name), 'utf8')

describe('icon sprite', () => {
  const used = [...read('icons.tsx').matchAll(/href="#ll-i-([\w-]+)"/g)].map((m) => m[1])
  const glyphSource = read('icon-glyphs.tsx')
  const drawn = [...glyphSource.matchAll(/^ {2}'?([\w-]+)'?: \(/gm)].map((m) => m[1])

  it('draws every icon that icons.tsx uses, once', () => {
    expect(used.length).toBeGreaterThan(30)
    expect(new Set(drawn).size).toBe(drawn.length)
    for (const id of used) expect(drawn, `symbol for #ll-i-${id}`).toContain(id)
  })

  it('has no shapes that nothing uses', () => {
    for (const id of drawn) expect(used, `icon using ${id}`).toContain(id)
  })

  it('keeps presentation on the <use> side, so colours and stroke widths still inherit', () => {
    // (Solid dots such as the Instagram and key dots keep their own fill, as before.)
    expect(glyphSource).not.toMatch(/strokeWidth=|className=|style=/)
  })
})
