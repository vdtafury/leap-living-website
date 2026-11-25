/**
 * The homepage hero plays ONE video: the client's hero reel, full length (no trimming),
 * web-encoded at crisp 1080p (~20-28 MB, ~2.5-3.5 Mbps, faststart, D-53) so it streams
 * smoothly from cPanel without buffering.
 *
 * It is git-ignored and placed on the server in `leapliving-data/` (symlinked to
 * `public/videos/hero/client-hero-original.mp4` and served directly by Apache).
 */
export const HERO_VIDEO_SRC = '/videos/hero/client-hero-original.mp4'

/**
 * The web-encoded 1080p hero streams at ~2.5-3.5 Mbps (D-53). Below ~3 Mbps it would keep
 * stopping to buffer, so the still frame 0 poster stays instead.
 */
export const HERO_MIN_DOWNLINK_MBPS = 3

/**
 * Chrome caps `downlink` at 10 and, for privacy, multiplies it by a random ±10% factor per
 * site. Measured on an unthrottled link (2026-11-17): 10, 9.9, 9.7, 9.1. A strict `< 10`
 * check would hide the video from about half of the fastest visitors, so the noise band
 * counts as 10.
 */
const DOWNLINK_NOISE = 0.1

/**
 * Phones stay on the frame-0 poster (84 KB WebP) instead of the ~150 MB video, to save data
 * and battery (owner, 2026-11-17). A phone is a narrow screen (portrait), or a touch screen
 * that is short (the same phone turned sideways: 844x390, 932x430). Tablets (768x1024,
 * 1024x768) and desktops still play the video.
 */
export const HERO_MOBILE_QUERY = '(max-width: 700px), (pointer: coarse) and (max-height: 500px)'

export interface HeroVideoContext {
  /** Whether the video file exists on this server (checked at build time). */
  hasVideo: boolean
  /** `navigator.connection` values. Safari and Firefox expose none of them. */
  saveData?: boolean
  effectiveType?: string
  downlink?: number
  hostname?: string
  /** Whether `HERO_MOBILE_QUERY` matches: phones keep the poster. */
  isMobile?: boolean
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export function isDevOrPreviewHost(hostname?: string): boolean {
  if (!hostname) return false
  if (LOCAL_HOSTS.has(hostname)) return true
  if (hostname.endsWith('.vercel.app')) return true
  return false
}

/**
 * Whether the hero video may load. When it may not, the poster (the video's own frame 0, in
 * full quality) stays on screen, so the visitor still sees the same picture.
 */
export function shouldPlayHeroVideo(ctx: HeroVideoContext): boolean {
  if (!ctx.hasVideo) return false
  if (ctx.isMobile) return false
  if (ctx.saveData) return false
  // Development and preview environments (e.g. Vercel) always play it so owners/reviewers see it working.
  if (ctx.hostname && isDevOrPreviewHost(ctx.hostname)) return true
  if (ctx.effectiveType && /(^|-)(2g|3g)$/.test(ctx.effectiveType)) return false
  if (ctx.downlink !== undefined && ctx.downlink < HERO_MIN_DOWNLINK_MBPS * (1 - DOWNLINK_NOISE))
    return false
  return true
}
