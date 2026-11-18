import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './admin.css'

export const metadata: Metadata = {
  title: { default: 'Admin | LEAP LIVING', template: '%s | LEAP LIVING Admin' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  // The `.adm` wrapper is added by the panel and sign-in pages; the draft preview renders the
  // public page markup without it.
  return children
}
