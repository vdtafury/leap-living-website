import { describe, expect, it } from 'vitest'
import { bioParagraphs, initials, mediaPhotoSources, visibleMembers } from './team'

describe('team helpers (D-57)', () => {
  it('builds initials from the first and last name', () => {
    expect(initials('Sara Al Mansoori')).toBe('SM')
    expect(initials('  omar  ')).toBe('O')
    expect(initials('')).toBe('')
  })

  it('splits a bio into paragraphs on line breaks', () => {
    expect(bioParagraphs('One.\n\n  Two.  \nThree.')).toEqual(['One.', 'Two.', 'Three.'])
    expect(bioParagraphs('   ')).toEqual([])
  })

  it('skips members without a name', () => {
    expect(visibleMembers([{ name: 'A' }, { name: '  ' }]).map((m) => m.name)).toEqual(['A'])
  })

  it('offers the 800 px copy of an uploaded photo', () => {
    expect(mediaPhotoSources('/media/abc-123.webp')).toEqual({
      src: '/media/abc-123.webp',
      srcSet: '/media/abc-123-800.webp 800w, /media/abc-123.webp 1600w',
    })
    expect(mediaPhotoSources('/images/team.jpg')).toBeNull()
  })
})
