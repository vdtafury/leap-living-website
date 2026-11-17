import { describe, expect, it } from 'vitest'
import { createRateLimiter } from './rate-limit'

describe('createRateLimiter', () => {
  it('allows `limit` hits per window, per key', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect(limiter.hit('a', 0).ok).toBe(true)
    expect(limiter.hit('a', 10).ok).toBe(true)
    expect(limiter.hit('a', 20)).toEqual({ ok: false, retryAfter: 1 })
    expect(limiter.hit('b', 20).ok).toBe(true)
  })

  it('resets after the window', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 })
    limiter.hit('a', 0)
    expect(limiter.hit('a', 500).ok).toBe(false)
    expect(limiter.hit('a', 1000).ok).toBe(true)
  })

  it('reports blocked keys without counting', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 })
    expect(limiter.blocked('a', 0)).toBe(false)
    limiter.hit('a', 0)
    expect(limiter.blocked('a', 1)).toBe(true)
    expect(limiter.blocked('a', 1000)).toBe(false)
  })
})
