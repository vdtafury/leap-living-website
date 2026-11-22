import { cache } from 'react'
import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, type Actor } from '@/modules/authorization'
import { withDefaults } from '../domain/fields'
import { DOCUMENTS, parseDocument, type DocumentKey, type DocumentTypes } from '../domain/registry'
import { upgradeSavedContent } from '../domain/upgrades'

type Result = { ok: true } | { ok: false; error: string }

function decode<K extends DocumentKey>(
  key: K,
  json: string | null | undefined,
): DocumentTypes[K] | null {
  if (!json) return null
  try {
    const saved = upgradeSavedContent(key, JSON.parse(json))
    const parsed = parseDocument(key, withDefaults(DOCUMENTS[key].defaults, saved))
    return parsed.ok ? parsed.data : null
  } catch {
    return null
  }
}

/**
 * Published content for the public site. Never returns a draft. Falls back to the built-in
 * text when the document was never published (or fails validation after a schema change).
 * Memoised per request, so the header, footer and page share one read.
 */
const readPublished = cache(async (key: DocumentKey) => {
  await ensureReady()
  const row = await prisma.contentDocument.findUnique({ where: { key } })
  return decode(key, row?.published) ?? DOCUMENTS[key].defaults
})

export async function getPublishedContent<K extends DocumentKey>(
  key: K,
): Promise<DocumentTypes[K]> {
  return (await readPublished(key)) as DocumentTypes[K]
}

export async function getContentForEditing<K extends DocumentKey>(actor: Actor, key: K) {
  authorize(actor, 'content.view')
  await ensureReady()
  const row = await prisma.contentDocument.findUnique({ where: { key } })
  const published = decode(key, row?.published)
  const draft =
    decode(key, row?.draft) ?? published ?? (DOCUMENTS[key].defaults as DocumentTypes[K])
  return {
    draft,
    hasUnpublishedChanges: !row?.published || row.draft !== row.published,
    updatedAt: row?.updatedAt ?? null,
    publishedAt: row?.publishedAt ?? null,
  }
}

/** Draft content for the admin preview (permission-checked). */
export async function getDraftContent<K extends DocumentKey>(actor: Actor, key: K) {
  return (await getContentForEditing(actor, key)).draft
}

export async function saveDraft(actor: Actor, key: DocumentKey, raw: unknown): Promise<Result> {
  authorize(actor, 'content.edit')
  const parsed = parseDocument(key, raw)
  if (!parsed.ok) return parsed
  const json = JSON.stringify(parsed.data)
  await prisma.$transaction(async (tx) => {
    await tx.contentDocument.upsert({
      where: { key },
      create: { key, draft: json, updatedById: actor.id },
      update: { draft: json, updatedById: actor.id },
    })
    await recordAudit(
      { actor, action: 'content.draft_saved', targetType: 'Content', targetId: key },
      tx,
    )
  })
  return { ok: true }
}

export async function publishContent(actor: Actor, key: DocumentKey): Promise<Result> {
  authorize(actor, 'content.publish')
  const row = await prisma.contentDocument.findUnique({ where: { key } })
  if (!row) return { ok: false, error: 'Save a draft first.' }
  let value: unknown
  try {
    value = JSON.parse(row.draft)
  } catch {
    return { ok: false, error: 'The draft is unreadable; save it again.' }
  }
  const parsed = parseDocument(key, value)
  if (!parsed.ok) return parsed
  const json = JSON.stringify(parsed.data)
  await prisma.$transaction(async (tx) => {
    await tx.contentDocument.update({
      where: { key },
      data: { draft: json, published: json, publishedAt: new Date(), publishedById: actor.id },
    })
    await tx.contentRevision.create({
      data: { documentKey: key, content: json, publishedById: actor.id },
    })
    await recordAudit(
      { actor, action: 'content.published', targetType: 'Content', targetId: key },
      tx,
    )
  })
  return { ok: true }
}

export async function discardDraft(actor: Actor, key: DocumentKey): Promise<Result> {
  authorize(actor, 'content.edit')
  const row = await prisma.contentDocument.findUnique({ where: { key } })
  const restored = row?.published ?? JSON.stringify(DOCUMENTS[key].defaults)
  await prisma.$transaction(async (tx) => {
    await tx.contentDocument.upsert({
      where: { key },
      create: { key, draft: restored, updatedById: actor.id },
      update: { draft: restored, updatedById: actor.id },
    })
    await recordAudit(
      { actor, action: 'content.draft_discarded', targetType: 'Content', targetId: key },
      tx,
    )
  })
  return { ok: true }
}

export async function listRevisions(actor: Actor, key: DocumentKey) {
  authorize(actor, 'content.view')
  await ensureReady()
  const revisions = await prisma.contentRevision.findMany({
    where: { documentKey: key },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, createdAt: true, publishedById: true },
  })
  const users = await prisma.user.findMany({
    where: { id: { in: revisions.map((r) => r.publishedById).filter((id): id is string => !!id) } },
    select: { id: true, name: true },
  })
  const nameById = new Map(users.map((u) => [u.id, u.name]))
  return revisions.map((r) => ({
    ...r,
    publishedBy: r.publishedById ? (nameById.get(r.publishedById) ?? '—') : '—',
  }))
}

/** Copies an earlier published version into the draft (publish again to make it live). */
export async function restoreRevision(
  actor: Actor,
  key: DocumentKey,
  revisionId: string,
): Promise<Result> {
  authorize(actor, 'content.edit')
  const revision = await prisma.contentRevision.findUnique({ where: { id: revisionId } })
  if (!revision || revision.documentKey !== key) return { ok: false, error: 'Version not found.' }
  await prisma.$transaction(async (tx) => {
    await tx.contentDocument.update({
      where: { key },
      data: { draft: revision.content, updatedById: actor.id },
    })
    await recordAudit(
      {
        actor,
        action: 'content.revision_restored',
        targetType: 'Content',
        targetId: key,
        metadata: { revisionId },
      },
      tx,
    )
  })
  return { ok: true }
}
