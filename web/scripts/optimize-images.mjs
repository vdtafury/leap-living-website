#!/usr/bin/env node
/**
 * Pre-generates responsive WebP variants for every photo in public/images
 * plus a manifest the <ResponsiveImg> component reads. Developer logos are
 * left as PNG on purpose: they are already tiny and WebP-with-alpha was larger.
 *
 *   npm run images:optimize
 *
 * Why pre-generate instead of next/image: the target host is shared cPanel
 * hosting where Sharp at runtime is not guaranteed (see
 * docs/deployment/compatibility-report.md). Static WebP files work anywhere.
 *
 * Output:
 *   public/images/opt/<name>-<width>.webp        (photos: 640 / 768 / 960 / 1280 / 1920)
 *   public/images/opt/<name>-portrait-<w>.webp   (art-directed crops, see CROPS)
 *   src/data/image-manifest.json
 * Re-run whenever an image in public/images is added or replaced.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const PUBLIC = path.join(ROOT, 'public')
const SRC_DIR = path.join(PUBLIC, 'images')
const OUT_DIR = path.join(SRC_DIR, 'opt')
const MANIFEST = path.join(ROOT, 'src', 'data', 'image-manifest.json')

const PHOTO_WIDTHS = [640, 768, 960, 1280, 1920]
const PHOTO_QUALITY = 70

/**
 * Art-directed portrait crops for full-bleed backgrounds. On a phone the hero
 * box is ~0.6 wide:tall, so object-fit: cover only shows a narrow centre strip
 * of a 16:9 photo. Serving that strip directly is both sharper and lighter
 * than shipping the whole landscape frame.
 * `x` is the horizontal focus (0–1), matching the CSS object-position;
 * `width` is the output width of the crop.
 */
const CROPS = {
  // 540×900 still carries ~2.8x the detail a phone saw from the landscape 960w.
  'hero-dubai-skyline.jpg': { aspect: 0.6, x: 0.5, width: 540 },
}

const isImage = (f) => /\.(jpe?g|png)$/i.test(f)
const kb = (n) => `${Math.round(n / 1024)}KB`

async function optimizePhotos(manifest) {
  await fs.mkdir(OUT_DIR, { recursive: true })
  const files = (await fs.readdir(SRC_DIR)).filter(isImage)
  let before = 0
  let after = 0

  for (const file of files) {
    const input = path.join(SRC_DIR, file)
    const base = file.replace(/\.[^.]+$/, '')
    const meta = await sharp(input).metadata()
    const widths = PHOTO_WIDTHS.filter((w) => w < meta.width)
    widths.push(Math.min(meta.width, PHOTO_WIDTHS.at(-1)))
    const unique = [...new Set(widths)].sort((a, b) => a - b)

    const variants = []
    for (const w of unique) {
      const outName = `${base}-${w}.webp`
      const out = path.join(OUT_DIR, outName)
      await sharp(input)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: PHOTO_QUALITY, effort: 6, smartSubsample: true })
        .toFile(out)
      variants.push({ w, src: `/images/opt/${outName}` })
    }

    const { size: srcSize } = await fs.stat(input)
    const { size: largest } = await fs.stat(path.join(OUT_DIR, `${base}-${unique.at(-1)}.webp`))
    before += srcSize
    after += largest
    manifest[`/images/${file}`] = {
      width: meta.width,
      height: meta.height,
      variants,
    }

    const crop = CROPS[file]
    if (crop) {
      const cropW = Math.round(meta.height * crop.aspect)
      const left = Math.round((meta.width - cropW) * crop.x)
      const outW = Math.min(crop.width, cropW)
      const outName = `${base}-portrait-${outW}.webp`
      await sharp(input)
        .extract({ left, top: 0, width: cropW, height: meta.height })
        .resize({ width: outW })
        .webp({ quality: PHOTO_QUALITY, effort: 6, smartSubsample: true })
        .toFile(path.join(OUT_DIR, outName))
      manifest[`/images/${file}`].portrait = { w: outW, src: `/images/opt/${outName}` }
    }
    console.log(
      `${file.padEnd(40)} ${kb(srcSize).padStart(7)} -> ${kb(largest).padStart(6)} @${unique.at(-1)}w`,
    )
  }
  console.log(`photos: ${kb(before)} -> ${kb(after)} (largest variants)`)
}

const manifest = {}
await optimizePhotos(manifest)
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
await fs.writeFile(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`)
console.log(`manifest: ${Object.keys(sorted).length} entries -> ${path.relative(ROOT, MANIFEST)}`)
