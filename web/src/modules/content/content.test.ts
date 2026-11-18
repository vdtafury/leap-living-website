import { beforeAll, describe, expect, it, vi } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment()
})

import { ensureReady } from '@/server/bootstrap'
import { DEFAULT_ABOUT, DEFAULT_HOME, DEFAULT_SETTINGS } from '@/data/content-defaults'
import { ForbiddenError } from '@/modules/authorization'
import {
  discardDraft,
  getContentForEditing,
  getPublishedContent,
  listRevisions,
  parseDocument,
  publishContent,
  restoreRevision,
  saveDraft,
  withDefaults,
} from '@/modules/content'
import { editor, nobody } from '@/test/actors'

beforeAll(async () => {
  await ensureReady()
})

describe('section registry', () => {
  it('accepts the current site text', () => {
    expect(parseDocument('home', DEFAULT_HOME).ok).toBe(true)
    expect(parseDocument('about', DEFAULT_ABOUT).ok).toBe(true)
    expect(parseDocument('settings', DEFAULT_SETTINGS).ok).toBe(true)
  })

  it('refuses script links, over-long text and missing fields', () => {
    const evil = structuredClone(DEFAULT_HOME)
    evil.hero.primaryCta.href = 'javascript:alert(1)'
    expect(parseDocument('home', evil).ok).toBe(false)
    const long = structuredClone(DEFAULT_HOME)
    long.hero.titleLine1 = 'x'.repeat(500)
    expect(parseDocument('home', long).ok).toBe(false)
    expect(parseDocument('home', { hero: {} }).ok).toBe(false)
  })

  it('fills fields added later from the defaults', () => {
    const merged = withDefaults(DEFAULT_HOME, { hero: { titleLine1: 'Changed' } })
    expect(merged.hero.titleLine1).toBe('Changed')
    expect(merged.hero.titleLine2).toBe(DEFAULT_HOME.hero.titleLine2)
  })
})

describe('draft / publish', () => {
  it('a saved draft is not public until published', async () => {
    const draft = structuredClone(DEFAULT_HOME)
    draft.hero.titleLine1 = 'Draft headline'
    expect((await saveDraft(editor(), 'home', draft)).ok).toBe(true)
    expect((await getPublishedContent('home')).hero.titleLine1).toBe('Unlock your')
    expect((await getContentForEditing(editor(), 'home')).hasUnpublishedChanges).toBe(true)

    expect((await publishContent(editor(), 'home')).ok).toBe(true)
    // getPublishedContent is memoised per request (React cache); outside a request it is not.
    expect((await getPublishedContent('home')).hero.titleLine1).toBe('Draft headline')
    expect(await listRevisions(editor(), 'home')).toHaveLength(1)
  })

  it('restoring an old version only changes the draft', async () => {
    const first = (await listRevisions(editor(), 'home'))[0]
    const next = structuredClone(DEFAULT_HOME)
    next.hero.titleLine1 = 'Second headline'
    await saveDraft(editor(), 'home', next)
    await publishContent(editor(), 'home')
    expect((await restoreRevision(editor(), 'home', first.id)).ok).toBe(true)
    expect((await getContentForEditing(editor(), 'home')).draft.hero.titleLine1).toBe(
      'Draft headline',
    )
    expect((await getPublishedContent('home')).hero.titleLine1).toBe('Second headline')
    await discardDraft(editor(), 'home')
    expect((await getContentForEditing(editor(), 'home')).draft.hero.titleLine1).toBe(
      'Second headline',
    )
  })

  it('denies edits without permission', async () => {
    await expect(saveDraft(nobody(), 'home', DEFAULT_HOME)).rejects.toBeInstanceOf(ForbiddenError)
    await expect(publishContent(nobody(), 'settings')).rejects.toBeInstanceOf(ForbiddenError)
  })
})
