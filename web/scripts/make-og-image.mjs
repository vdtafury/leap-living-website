/**
 * Builds the link-preview image (WhatsApp, LinkedIn, X): public/brand/og-image.jpg, 1200x630.
 * The hero's frame 0 under a deep brand-teal wash, with the white stacked logo centred.
 *
 *   node scripts/make-og-image.mjs
 *
 * Re-run after the hero poster or the logo changes. Kept small (WhatsApp skips large images).
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const W = 1200
const H = 630
const OUT = path.join(ROOT, 'public/brand/og-image.jpg')

const background = await sharp(path.join(ROOT, 'public/images/client-video-frame-0.jpg'))
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .toBuffer()

// Brand teal #185C5E -> #3B9EA1, strong enough for the white logo to read at thumbnail size.
const wash = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#185C5E" stop-opacity="0.86"/>
    <stop offset="1" stop-color="#3B9EA1" stop-opacity="0.72"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`)

const logo = await sharp(path.join(ROOT, '../docs/client-assets/brand-kit/logo-stacked-white.png'))
  .resize({ height: 300, fit: 'inside' })
  .toBuffer()
const meta = await sharp(logo).metadata()

await sharp(background)
  .composite([
    { input: wash },
    { input: logo, left: Math.round((W - meta.width) / 2), top: Math.round((H - meta.height) / 2) },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(OUT)

const { size } = fs.statSync(OUT)
console.log(`${path.relative(ROOT, OUT)}: ${W}x${H}, ${Math.round(size / 1024)} KB`)
