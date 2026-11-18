import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getActor } from '@/server/auth/current'
import { CookieBlockedNotice, LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage() {
  const actor = await getActor()
  if (actor) redirect(actor.mustChangePassword ? '/admin/change-password' : '/admin')
  return (
    <div className="adm">
      <div className="adm-auth">
        <div className="adm-auth-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal-brand.png" alt="LEAP LIVING" />
          <h1>Admin sign in</h1>
          <p>For the Leap Living team only.</p>
          <CookieBlockedNotice />
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
