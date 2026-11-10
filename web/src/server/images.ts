import sharp from 'sharp'

export interface ImageMetadata {
  width: number | null
  height: number | null
  format: string | null
}

export async function getImageMetadata(input: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(input).metadata()
  return {
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    format: metadata.format ?? null,
  }
}

export async function resizeImage(input: Buffer, width: number): Promise<Buffer> {
  return sharp(input)
    .resize(width, undefined, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()
}
