import Link from 'next/link'
import type { ComponentType } from 'react'
import { ArrowUpRightIcon } from '@/components/ui/icons'

export interface PlanStep {
  href: string
  icon: ComponentType<{ size?: number }>
  title: string
  text: string
}

/** Closing link list of the Buy / Rent pages: next steps that open tools already on the site. */
export function ListingsPlan({
  title,
  lead,
  steps,
}: {
  title: string
  lead: string
  steps: PlanStep[]
}) {
  return (
    <section className="ll-lplan" aria-labelledby="ll-lplan-title">
      <div className="ll-container ll-lplan-inner">
        <div className="ll-lplan-head">
          <h2 id="ll-lplan-title" className="ll-serif-title ll-lplan-title">
            {title}
          </h2>
          <p className="ll-lplan-lead">{lead}</p>
        </div>
        <ul className="ll-lplan-list">
          {steps.map(({ href, icon: Icon, title: stepTitle, text }) => (
            <li key={href}>
              <Link href={href} className="ll-lplan-row">
                <span className="ll-lplan-icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <span className="ll-lplan-text">
                  <strong>{stepTitle}</strong>
                  <span>{text}</span>
                </span>
                <span className="ll-lplan-arrow" aria-hidden="true">
                  <ArrowUpRightIcon size={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
