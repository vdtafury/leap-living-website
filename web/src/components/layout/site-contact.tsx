'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { SiteContact } from '@/lib/contact-links'

const SiteContactContext = createContext<SiteContact | null>(null)

/**
 * The company's phone, WhatsApp and email from Admin → Site settings, for client components
 * that link to them (property card contact buttons, D-46). Set once in the root layout.
 */
export function SiteContactProvider({
  contact,
  children,
}: {
  contact: SiteContact
  children: ReactNode
}) {
  return <SiteContactContext.Provider value={contact}>{children}</SiteContactContext.Provider>
}

export function useSiteContact(): SiteContact | null {
  return useContext(SiteContactContext)
}
