import type { Metadata } from 'next'
import Link from 'next/link'
import { csrfToken, requireActor } from '@/server/auth/current'
import { PasswordForm } from './password-form'

export const metadata: Metadata = { title: 'Change password' }

export default async function ChangePasswordPage() {
  const actor = await requireActor(undefined, { allowPasswordChange: true })
  return (
    <div className="adm">
      <div className="adm-auth">
        <div className="adm-auth-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal-teal.png" alt="LEAP LIVING" />
          <h1>{actor.mustChangePassword ? 'Choose your own password' : 'Change password'}</h1>
          <p>
            {actor.mustChangePassword
              ? 'This account uses a temporary password. Choose a new one to continue.'
              : 'You will stay signed in on this device; other devices are signed out.'}
          </p>
          <PasswordForm csrf={csrfToken(actor)} username={actor.username} />
          {!actor.mustChangePassword && (
            <p style={{ marginTop: '1rem', marginBottom: 0 }}>
              <Link href="/admin">Back to the dashboard</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
