import type { ReactNode } from 'react'
import { KeyholeMark } from '@/components/ui/keyhole-mark'
import { CheckIcon } from '@/components/ui/icons'

const BENEFITS = [
  'Save properties and projects with the heart, on any device',
  'Follow the requests you send us in one place',
  'Your details are filled in for you when you contact us',
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
              <p className="ll-acc-auth-aside-title">Your LEAP LIVING account</p>
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
