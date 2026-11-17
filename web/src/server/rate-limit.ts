/**
 * In-memory fixed-window rate limiter. Good enough for one Node process (cPanel/Passenger runs
 * one or a few); counts reset on restart. Not a substitute for a WAF, just a brake on floods.
 */
export interface RateLimitResult {
  ok: boolean
  /** Seconds until the window resets (for the Retry-After header). */
  retryAfter: number
}

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return {
    /** True while `key` has used up its window (without counting a new hit). */
    blocked(key: string, now = Date.now()): boolean {
      const entry = hits.get(key)
      return Boolean(entry && entry.resetAt > now && entry.count >= limit)
    },
    hit(key: string, now = Date.now()): RateLimitResult {
      // Drop expired windows now and then, so the map cannot grow without bound.
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
      }
      let entry = hits.get(key)
      if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + windowMs }
        hits.set(key, entry)
      }
      entry.count += 1
      return {
        ok: entry.count <= limit,
        retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      }
    },
  }
}
