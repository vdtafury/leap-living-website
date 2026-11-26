/**
 * In-memory fixed-window rate limiter. Good enough for one Node process (cPanel/Passenger runs
 * one or a few); counts reset on restart. Not a substitute for a WAF, just a brake on floods.
 */
export interface RateLimitResult {
  ok: boolean
  /** Seconds until the window resets (for the Retry-After header). */
  retryAfter: number
}

const MAX_KEYS = 5000

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>()
  let nextSweepAt = 0

  return {
    /** True while `key` has used up its window (without counting a new hit). */
    blocked(key: string, now = Date.now()): boolean {
      const entry = hits.get(key)
      return Boolean(entry && entry.resetAt > now && entry.count >= limit)
    },
    hit(key: string, now = Date.now()): RateLimitResult {
      let entry = hits.get(key)
      if (!entry || entry.resetAt <= now) {
        if (!entry && hits.size >= MAX_KEYS) {
          // Sweep expired entries at most once per interval to avoid O(N^2) work under flood.
          if (now >= nextSweepAt) {
            for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
            nextSweepAt = now + Math.min(windowMs, 10_000)
          }
          // Hard memory cap: evict the oldest key when still full.
          while (hits.size >= MAX_KEYS) {
            const oldest = hits.keys().next().value
            if (oldest === undefined) break
            hits.delete(oldest)
          }
        }
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
