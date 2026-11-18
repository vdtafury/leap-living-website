import Link from 'next/link'
import type { ReactNode } from 'react'
import { csrfToken, requireActor } from '@/server/auth/current'
import { can, type PermissionKey } from '@/modules/authorization'
import { logoutAction } from '../actions'
import { NavLink, SubmitButton } from '../_components/client'
import { CsrfInput } from '../_components/ui'

const NAV: { group?: string; href: string; label: string; permission: PermissionKey }[] = [
  { href: '/admin', label: 'Dashboard', permission: 'dashboard.view' },
  {
    group: 'Listings',
    href: '/admin/properties',
    label: 'Properties',
    permission: 'property.view',
  },
  { href: '/admin/projects', label: 'Projects', permission: 'project.view' },
  { href: '/admin/media', label: 'Images', permission: 'media.view' },
  { group: 'Website', href: '/admin/content/home', label: 'Homepage', permission: 'content.view' },
  { href: '/admin/content/about', label: 'About page', permission: 'content.view' },
  { href: '/admin/content/settings', label: 'Site settings', permission: 'content.view' },
  { href: '/admin/developers', label: 'Developers', permission: 'developer.manage' },
  {
    group: 'Requests',
    href: '/admin/inquiries',
    label: 'Form requests',
    permission: 'inquiry.view',
  },
  { href: '/admin/outbox', label: 'Email queue', permission: 'email.view' },
  { group: 'Administration', href: '/admin/users', label: 'Users', permission: 'user.view' },
  { href: '/admin/audit', label: 'Audit log', permission: 'audit.view' },
]

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const actor = await requireActor()
  const items = NAV.filter((item) => can(actor, item.permission))
  return (
    <div className="adm">
      <div className="adm-shell">
        <aside className="adm-side">
          <Link href="/admin" className="adm-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-horizontal-white.png" alt="LEAP LIVING" />
          </Link>
          <nav className="adm-nav" aria-label="Admin">
            {items.map((item) => (
              <div key={item.href} style={{ display: 'contents' }}>
                {item.group && <div className="adm-nav-group">{item.group}</div>}
                <NavLink href={item.href}>{item.label}</NavLink>
              </div>
            ))}
          </nav>
          <div className="adm-side-foot">
            <div>
              Signed in as <strong>{actor.name}</strong>
              <div style={{ opacity: 0.75 }}>{actor.username}</div>
            </div>
            <Link href="/" target="_blank" rel="noopener">
              View website
            </Link>
            <Link href="/admin/change-password">Change password</Link>
            <form action={logoutAction}>
              <CsrfInput token={csrfToken(actor)} />
              <SubmitButton className="">Sign out</SubmitButton>
            </form>
          </div>
        </aside>
        <main className="adm-main">{children}</main>
      </div>
    </div>
  )
}
