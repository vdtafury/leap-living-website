import type { ReactNode } from 'react'
import { KeyholeMark } from '@/components/ui/keyhole-mark'
import { CheckIcon } from '@/components/ui/icons'

// Wording after the big property sites (Rightmove, Property Finder, Sotheby's): short account
// benefits, and only what this account really does (no alerts or saved searches yet).
const BENEFITS = [
  'Save properties and projects in one tap',
  'Pick up where you left off, on any device',
  'Follow every request you send us, from received to closed',
]

/** Two-panel frame for sign-in, sign-up and password pages. */
export function AuthShell({
  title,
  intro,
  children,
  footer,
}: {
  title: string
  intro?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="ll-acc-auth">
      <div className="ll-container">
        <div className="ll-acc-auth-card">
          <aside className="ll-acc-auth-aside" aria-hidden="true">
            <KeyholeMark className="ll-keyhole ll-acc-keyhole" strokeWidth={1.4} />
            <div className="ll-acc-auth-aside-inner">
              <p className="ll-acc-auth-aside-title">Your private shortlist</p>
              <ul className="ll-acc-benefits">
                {BENEFITS.map((item) => (
                  <li key={item}>
                    <CheckIcon size={15} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <div className="ll-acc-auth-body">
            <h1 className="ll-acc-title">{title}</h1>
            {intro && <div className="ll-acc-intro">{intro}</div>}
            {children}
            {footer && <div className="ll-acc-auth-foot">{footer}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}
