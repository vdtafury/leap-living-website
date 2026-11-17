/**
 * The homepage hero plays ONE video: the client's original file, exactly as delivered
 * (~150 MB, 1080p60, owner decision 2026-11-17: no lighter re-encoded versions).
 *
 * It is git-ignored (over GitHub's 100 MB limit) and placed on the build machine with
 * scripts/prepare-hero-original.sh. The page checks at build time whether it exists.
 */
export const HERO_VIDEO_SRC = '/videos/hero/client-hero-original.mp4'

/**
 * The original streams at ~16 Mbps. Below 10 Mbps it would keep stopping to buffer, so the
 * still frame 0 poster stays instead.
 */
export const HERO_MIN_DOWNLINK_MBPS = 10

/**
 * Chrome caps `downlink` at 10 and, for privacy, multiplies it by a random ±10% factor per
 * site. Measured on an unthrottled link (2026-11-17): 10, 9.9, 9.7, 9.1. A strict `< 10`
 * check would hide the video from about half of the fastest visitors, so the noise band
 * counts as 10.
 */
const DOWNLINK_NOISE = 0.1

export interface HeroVideoContext {
  /** Whether the video file exists on this server (checked at build time). */
  hasVideo: boolean
  /** `navigator.connection` values. Safari and Firefox expose none of them. */
  saveData?: boolean
  effectiveType?: string
  downlink?: number
  hostname?: string
  /** Whether running on a mobile viewport / device (phones stay on the 84KB WebP poster). */
  isMobile?: boolean
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

/**
 * Whether the hero video may load. When it may not, the poster (the video's own frame 0, in
 * full quality) stays on screen, so the visitor still sees the same picture.
 */
export function shouldPlayHeroVideo(ctx: HeroVideoContext): boolean {
  if (!ctx.hasVideo) return false
  if (ctx.isMobile) return false
  if (ctx.saveData) return false
  // Development machines always play it, whatever Chrome guesses about the link.
  if (ctx.hostname && LOCAL_HOSTS.has(ctx.hostname)) return true
  if (ctx.effectiveType && /(^|-)(2g|3g)$/.test(ctx.effectiveType)) return false
  if (ctx.downlink !== undefined && ctx.downlink < HERO_MIN_DOWNLINK_MBPS * (1 - DOWNLINK_NOISE)) return false
  return true
}
