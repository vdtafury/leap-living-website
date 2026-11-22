import type { DocumentKey } from './registry'

/**
 * Content edits the client asked for after a document was already saved in a database.
 * The built-in defaults only seed empty databases, so saved copies (draft and published) are
 * upgraded when read. Each rule matches the old built-in text exactly: anything an editor has
 * since changed is left alone.
 */
type Card = { icon?: unknown; title?: unknown; desc?: unknown; [key: string]: unknown }

/** D-52 (client, 2026-11-19): Consultancy replaces "Disposition & Sales" in the services bar. */
const OLD_DISPOSITION_TITLE = 'Disposition & Sales'
const OLD_DISPOSITION_DESCS = new Set([
  'Maximize value through strategic positioning.',
  'Institutional positioning, discreet buyer qualification, and strategic exit execution.',
])
const CONSULTANCY = {
  icon: 'compass',
  title: 'Consultancy',
  desc: 'Independent, strategic real estate guidance.',
}

function upgradeHome(value: Record<string, unknown>): Record<string, unknown> {
  const services = value.services as { items?: unknown } | undefined
  if (!services || !Array.isArray(services.items)) return value
  let changed = false
  const items = (services.items as Card[]).map((card) => {
    if (
      card &&
      card.title === OLD_DISPOSITION_TITLE &&
      (typeof card.desc !== 'string' || OLD_DISPOSITION_DESCS.has(card.desc))
    ) {
      changed = true
      return { ...card, ...CONSULTANCY }
    }
    return card
  })
  return changed ? { ...value, services: { ...services, items } } : value
}

export function upgradeSavedContent(key: DocumentKey, value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  if (key === 'home') return upgradeHome(value as Record<string, unknown>)
  return value
}
