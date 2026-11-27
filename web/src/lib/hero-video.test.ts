import { describe, expect, it } from 'vitest'
import { HERO_MIN_DOWNLINK_MBPS, shouldPlayHeroVideo } from './hero-video'

describe('shouldPlayHeroVideo', () => {
  const site = { hasVideo: true, hostname: 'leapliving.ae' }

  it('plays when the browser reports nothing (Safari, Firefox)', () => {
    expect(shouldPlayHeroVideo(site)).toBe(true)
  })

  it('never plays when the file is not on the server', () => {
    expect(shouldPlayHeroVideo({ ...site, hasVideo: false })).toBe(false)
    expect(shouldPlayHeroVideo({ hasVideo: false, hostname: 'localhost' })).toBe(false)
  })

  it('respects Save-Data, even on localhost', () => {
    expect(shouldPlayHeroVideo({ ...site, saveData: true })).toBe(false)
    expect(shouldPlayHeroVideo({ hasVideo: true, hostname: 'localhost', saveData: true })).toBe(
      false,
    )
  })

  it('skips on mobile viewports to save data and battery', () => {
    expect(shouldPlayHeroVideo({ ...site, isMobile: true })).toBe(false)
    expect(shouldPlayHeroVideo({ hasVideo: true, hostname: 'localhost', isMobile: true })).toBe(
      false,
    )
  })

  it('skips 2G and 3G', () => {
    for (const effectiveType of ['slow-2g', '2g', '3g']) {
      expect(shouldPlayHeroVideo({ ...site, effectiveType })).toBe(false)
    }
    expect(shouldPlayHeroVideo({ ...site, effectiveType: '4g', downlink: 10 })).toBe(true)
  })

  it(`needs at least ${HERO_MIN_DOWNLINK_MBPS} Mbps (with ±10% Chrome noise) to skip slow links`, () => {
    expect(HERO_MIN_DOWNLINK_MBPS).toBe(1.5)
    // Chrome's ±10% privacy noise around 1.5 Mbps: >= 1.35 still counts as fast enough.
    expect(shouldPlayHeroVideo({ ...site, downlink: 10 })).toBe(true)
    expect(shouldPlayHeroVideo({ ...site, downlink: 2.2 })).toBe(true)
    expect(shouldPlayHeroVideo({ ...site, downlink: 1.4 })).toBe(true)
    expect(shouldPlayHeroVideo({ ...site, downlink: 1.2 })).toBe(false)
    expect(shouldPlayHeroVideo({ ...site, downlink: 0.8 })).toBe(false)
  })

  it('always plays on a development machine or staging host, whatever the speed estimate', () => {
    for (const hostname of ['localhost', '127.0.0.1', 'staging.leapliving.ae']) {
      expect(
        shouldPlayHeroVideo({ hasVideo: true, hostname, downlink: 1.2, effectiveType: '3g' }),
      ).toBe(true)
    }
  })
})
