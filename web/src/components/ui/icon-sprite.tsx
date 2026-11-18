'use client'

import { ICON_GLYPHS } from './icon-glyphs'

/**
 * Every icon drawn once per page; icons.tsx points at these symbols with <use>. Rendered at
 * the end of <body> by the root layout (a <use> may reference a symbol later in the document).
 * A client component on purpose: its shapes then travel once in the (cached) JS bundle instead
 * of in every page's HTML and again in its React payload.
 */
export function IconSprite() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {Object.entries(ICON_GLYPHS).map(([id, glyph]) => (
          <symbol key={id} id={`ll-i-${id}`} viewBox="0 0 24 24">
            {glyph}
          </symbol>
        ))}
      </defs>
    </svg>
  )
}
