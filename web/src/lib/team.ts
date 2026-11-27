/** Pure helpers for the About page's Meet the Team section (D-57). */

/** Two letters for a member without a photo yet: "Sara Al Mansoori" -> "SM". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = words[0][0] ?? ''
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : ''
  return (first + last).toUpperCase()
}

/** Bio text as paragraphs (editors separate them with line breaks). */
export function bioParagraphs(bio: string): string[] {
  return bio
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** Members that can be shown: a name is the minimum (the admin requires one anyway). */
export function visibleMembers<T extends { name: string }>(members: readonly T[]): T[] {
  return members.filter((m) => m.name.trim().length > 0)
}

/**
 * Responsive sources for a team photo. Uploaded photos (/media/<id>.webp) also exist as an
 * 800 px copy (media module), so cards can use the small one.
 */
export function mediaPhotoSources(src: string): { src: string; srcSet?: string } | null {
  const media = /^\/media\/([A-Za-z0-9-]+)\.webp$/.exec(src)
  return media ? { src, srcSet: `/media/${media[1]}-800.webp 800w, ${src} 1600w` } : null
}
