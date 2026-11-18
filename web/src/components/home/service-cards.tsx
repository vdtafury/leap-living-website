import type { ComponentType } from 'react'
import Link from 'next/link'
import {
  ArrowUpRightIcon,
  ChartUpIcon,
  CompassIcon,
  HandshakeIcon,
  HomeIcon,
  KeyIcon,
  ShieldCheckIcon,
  StackIcon,
} from '@/components/ui/icons'

type IconComponent = ComponentType<{ size?: number }>

const SERVICE_ICONS: Record<string, IconComponent> = {
  home: HomeIcon,
  chart: ChartUpIcon,
  handshake: HandshakeIcon,
  layers: StackIcon,
  compass: CompassIcon,
  key: KeyIcon,
  shield: ShieldCheckIcon,
}

/** "Automatic" icon: picked from words in the title, so new services get a sensible one. */
const AUTO_RULES: [RegExp, string][] = [
  [/acqui|buy|purchas|sourc/i, 'home'],
  [/invest|yield|capital|strateg/i, 'chart'],
  [/sale|sell|dispos|exit|negotia/i, 'handshake'],
  [/portfolio|asset|wealth/i, 'layers'],
  [/rent|leas|tenan/i, 'key'],
  [/manage|govern|protect|legal/i, 'shield'],
  [/consult|advis|research|feasib/i, 'compass'],
]

function iconFor(icon: string | undefined, title: string): IconComponent {
  if (icon && icon !== 'auto' && SERVICE_ICONS[icon]) return SERVICE_ICONS[icon]
  const match = AUTO_RULES.find(([re]) => re.test(title))
  return SERVICE_ICONS[match ? match[1] : 'compass']
}

type ServiceCardsProps = {
  eyebrow: string
  title: string
  intro: string
  linkLabel: string
  linkHref: string
  items: { icon?: string; title: string; desc: string; tag?: string; featured?: boolean }[]
}

/**
 * Homepage services (D-48, owner's design 2026-11-18): heading block on the left
 * (eyebrow with a short rule, title, one-line intro, link), one white card per service
 * on the right (teal line icon, title, short description). Server component, no JS.
 */
export function ServiceCards({
  eyebrow,
  title,
  intro,
  linkLabel,
  linkHref,
  items,
}: ServiceCardsProps) {
  const cols = items.length <= 4 ? items.length : 3
  return (
    <div className="ll-svc">
      <div className="ll-svc-head">
        {eyebrow && <p className="ll-svc-eyebrow">{eyebrow}</p>}
        <h2 className="ll-serif-title ll-section-title ll-svc-title">{title}</h2>
        {intro && <p className="ll-svc-intro">{intro}</p>}
        {linkLabel && (
          <Link href={linkHref} className="ll-link-arrow ll-svc-link">
            <span>{linkLabel}</span>
            <ArrowUpRightIcon size={15} />
          </Link>
        )}
      </div>

      <ul className="ll-svc-grid" style={{ '--svc-cols': cols } as React.CSSProperties}>
        {items.map((item, i) => {
          const Icon = iconFor(item.icon, item.title)
          return (
            <li key={`${i}-${item.title}`} className="ll-svc-card">
              <span className="ll-svc-icon" aria-hidden="true">
                <Icon size={36} />
              </span>
              {item.featured && item.tag && <span className="ll-svc-tag">{item.tag}</span>}
              <h3 className="ll-svc-card-title">{item.title}</h3>
              <p className="ll-svc-card-desc">{item.desc}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
