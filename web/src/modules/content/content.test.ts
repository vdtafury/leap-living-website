import { beforeAll, describe, expect, it, vi } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment()
})

import { ensureReady } from '@/server/bootstrap'
import { prisma } from '@/server/db'
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
  it('keeps services saved before the icon and intro fields existed (D-48)', () => {
    const old = structuredClone(DEFAULT_HOME) as Record<string, unknown>
    old.services = {
      title: 'End-to-End Real Estate Advisory',
      linkLabel: 'Explore Full Service Scope',
      linkHref: '/about#services',
      items: [{ title: 'Real Estate Consultancy', desc: 'Old text', featured: true, tag: 'Core' }],
    }
    const parsed = parseDocument('home', withDefaults(DEFAULT_HOME, old))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.services.items[0].icon).toBe('auto')
    expect(parsed.data.services.items[0].title).toBe('Real Estate Consultancy')
    expect(parsed.data.services.intro).toBe(DEFAULT_HOME.services.intro)
  })

  it('rejects an unknown service icon', () => {
    const bad = structuredClone(DEFAULT_HOME)
    bad.services.items[0].icon = 'rocket'
    expect(parseDocument('home', bad).ok).toBe(false)
  })

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

  it('upgrades a homepage saved before D-52: Consultancy card, no stats band', async () => {
    // As stored by a site seeded before the client's 2026-11-19 changes
    const old = structuredClone(DEFAULT_HOME) as Record<string, unknown> & {
      services: { items: Record<string, unknown>[] }
    }
    old.stats = { items: [{ value: '21+ Years', description: 'Old band' }] }
    old.services.items[2] = {
      ...old.services.items[2],
      icon: 'handshake',
      title: 'Disposition & Sales',
      desc: 'Maximize value through strategic positioning.',
    }
    // An editor's own card that merely shares the title is left alone
    old.services.items[3] = {
      ...old.services.items[3],
      title: 'Disposition & Sales',
      desc: 'Edited text',
    }
    const json = JSON.stringify(old)
    await prisma.contentDocument.update({
      where: { key: 'home' },
      data: { draft: json, published: json },
    })

    const published = await getPublishedContent('home')
    expect(published.services.items[2]).toMatchObject({
      icon: 'compass',
      title: 'Consultancy',
      desc: 'Independent, strategic real estate guidance.',
    })
    expect(published.services.items[3]).toMatchObject({ title: 'Disposition & Sales' })
    expect('stats' in published).toBe(false)
    const editing = await getContentForEditing(editor(), 'home')
    expect(editing.draft.services.items[2].title).toBe('Consultancy')
  })

  it('denies edits without permission', async () => {
    await expect(saveDraft(nobody(), 'home', DEFAULT_HOME)).rejects.toBeInstanceOf(ForbiddenError)
    await expect(publishContent(nobody(), 'settings')).rejects.toBeInstanceOf(ForbiddenError)
  })
})
