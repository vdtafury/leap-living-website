import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRightIcon } from '@/components/ui/icons'
import { KeyholeMark } from '@/components/ui/keyhole-mark'

const QUICK_LINKS = [
  { href: '/buy', label: 'Properties for sale' },
  { href: '/rent', label: 'Properties for rent' },
  { href: '/projects', label: 'Dubai projects' },
  { href: '/sell', label: 'Free property valuation' },
  { href: '/mortgage', label: 'Mortgage calculator' },
  { href: '/contact', label: 'Contact our advisors' },
]

/** Branded full-band layout shared by the 404 and error pages. */
export function StatusPage({
  code,
  eyebrow,
  title,
  description,
  actions,
}: {
  code: string
  eyebrow: string
  title: string
  description: string
  actions: ReactNode
}) {
  return (
    <section className="ll-status-page">
      <KeyholeMark className="ll-status-keyhole" strokeWidth={1.4} />
      <div className="ll-container ll-status-inner">
        <div className="ll-status-copy">
          <p className="ll-status-code" aria-hidden="true">
            {code}
          </p>
          <div className="ll-eyebrow ll-status-eyebrow">{eyebrow}</div>
          <h1 className="ll-status-title">{title}</h1>
          <p className="ll-status-desc">{description}</p>
          <div className="ll-status-actions">{actions}</div>
        </div>

        <nav className="ll-status-links" aria-label="Popular pages">
          <p className="ll-status-links-title">Popular pages</p>
          <ul>
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>
                  <span>{link.label}</span>
                  <ArrowRightIcon size={15} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
