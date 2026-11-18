import type { prisma } from '@/server/db'
import { DOCUMENTS, type DocumentKey } from '../domain/registry'

/** First start: the current site text becomes the published version of every document. */
export async function seedContent(db: Pick<typeof prisma, 'contentDocument'>): Promise<number> {
  let created = 0
  for (const key of Object.keys(DOCUMENTS) as DocumentKey[]) {
    if (await db.contentDocument.findUnique({ where: { key } })) continue
    const json = JSON.stringify(DOCUMENTS[key].defaults)
    await db.contentDocument.create({
      data: { key, draft: json, published: json, publishedAt: new Date() },
    })
    created++
  }
  return created
}
