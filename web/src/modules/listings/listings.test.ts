import { beforeAll, describe, expect, it, vi } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment()
})

import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { PROJECTS, PROPERTIES } from '@/data/catalog'
import { ForbiddenError } from '@/modules/authorization'
import {
  createProperty,
  deleteProperty,
  getPublishedProject,
  getPublishedProperty,
  listPublishedProjects,
  listPublishedProperties,
  setProjectPublication,
  setPropertyPublication,
  updateProperty,
} from '@/modules/listings'
import { editor, nobody, superAdmin } from '@/test/actors'

beforeAll(async () => {
  await ensureReady()
})

const draftInput = {
  title: 'Hidden Draft Villa',
  subtitle: '',
  slug: '',
  referenceNumber: 'LL-TEST-1',
  transactionType: 'BUY',
  segment: 'RESIDENTIAL',
  propertyType: 'Villa',
  availabilityStatus: 'AVAILABLE',
  highlightLabel: '',
  featured: true,
  sortOrder: 0,
  community: 'Test Community',
  emirate: 'Dubai',
  price: '1,250,000',
  priceFrequency: '',
  beds: 3,
  baths: 3,
  area: '2400',
  completionStatus: 'Ready',
  developer: '',
  description: '',
  highlights: [],
  images: [],
  permitNumber: '',
}

describe('starter content', () => {
  it('imports every listing and project so the public pages look the same', async () => {
    // `id` is the database id (used by the save heart); everything else must match the starter data.
    const withoutId = <T extends { id?: string }>({ id, ...rest }: T) => {
      expect(id).toEqual(expect.any(String))
      return rest
    }
    const properties = await listPublishedProperties()
    expect(properties.map(withoutId)).toEqual(PROPERTIES.map((p) => ({ ...p })))
    const projects = await listPublishedProjects()
    expect(projects.map(withoutId)).toEqual(PROJECTS)
  })

  it('runs once: deleting a starter item does not bring it back', async () => {
    const { seedStarterContent } = await import('@/server/bootstrap')
    expect(await seedStarterContent()).toBe(false)
  })
})

describe('draft is not published', () => {
  it('a new listing is a draft, unreachable by slug and absent from lists', async () => {
    const created = await createProperty(editor(), draftInput)
    expect(created.ok).toBe(true)
    expect(await getPublishedProperty('hidden-draft-villa')).toBeNull()
    expect((await listPublishedProperties()).some((p) => p.slug === 'hidden-draft-villa')).toBe(
      false,
    )
  })

  it('cannot be published without an image and a description', async () => {
    const row = await prisma.property.findUniqueOrThrow({ where: { slug: 'hidden-draft-villa' } })
    const result = await setPropertyPublication(editor(), row.id, 'PUBLISHED')
    expect(result.ok).toBe(false)
  })

  it('becomes public when published, and private again when archived or deleted', async () => {
    const row = await prisma.property.findUniqueOrThrow({ where: { slug: 'hidden-draft-villa' } })
    const update = await updateProperty(editor(), row.id, {
      ...draftInput,
      description: 'A finished description.',
      images: [{ url: '/images/property-palm-villa.jpg', alt: 'Villa' }],
    })
    expect(update.ok).toBe(true)
    expect((await setPropertyPublication(editor(), row.id, 'PUBLISHED')).ok).toBe(true)
    const shown = await getPublishedProperty('hidden-draft-villa')
    expect(shown?.priceLabel).toBe('AED 1,250,000')

    await setPropertyPublication(editor(), row.id, 'ARCHIVED')
    expect(await getPublishedProperty('hidden-draft-villa')).toBeNull()

    await setPropertyPublication(editor(), row.id, 'PUBLISHED')
    await deleteProperty(superAdmin(), row.id)
    expect(await getPublishedProperty('hidden-draft-villa')).toBeNull()
    expect((await listPublishedProperties()).some((p) => p.slug === 'hidden-draft-villa')).toBe(
      false,
    )
  })

  it('an unpublished project is unreachable too', async () => {
    const project = await prisma.project.findFirstOrThrow({ where: { slug: PROJECTS[0].slug } })
    await setProjectPublication(superAdmin(), project.id, 'DRAFT')
    expect(await getPublishedProject(PROJECTS[0].slug)).toBeNull()
    expect((await listPublishedProjects()).length).toBe(PROJECTS.length - 1)
    await setProjectPublication(superAdmin(), project.id, 'PUBLISHED')
  })
})

describe('crafted requests without permission are denied', () => {
  it('no permission, no write', async () => {
    await expect(createProperty(nobody(), draftInput)).rejects.toBeInstanceOf(ForbiddenError)
    const row = await prisma.property.findFirstOrThrow({ where: { deletedAt: null } })
    await expect(setPropertyPublication(nobody(), row.id, 'DRAFT')).rejects.toBeInstanceOf(
      ForbiddenError,
    )
    // Editors publish but do not delete
    await expect(deleteProperty(editor(), row.id)).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('rejects external or traversal image URLs and bad slugs', async () => {
    const bad = [
      { images: [{ url: 'https://evil.example/x.jpg', alt: '' }] },
      { images: [{ url: '/media/../../etc/passwd', alt: '' }] },
      { images: [{ url: 'javascript:alert(1)', alt: '' }] },
      { slug: '../admin' },
      { price: '-5' },
    ]
    for (const patch of bad) {
      const result = await createProperty(editor(), {
        ...draftInput,
        referenceNumber: 'LL-BAD-1',
        ...patch,
      })
      expect(result.ok).toBe(false)
    }
  })
})
