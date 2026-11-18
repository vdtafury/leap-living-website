import Link from 'next/link'
import type { Metadata } from 'next'
import { resetTokenUsable } from '@/modules/customers'
import { AuthShell } from '@/components/account/auth-shell'
import { ResetPasswordForm } from '@/components/account/account-forms'

export const metadata: Metadata = {
  title: 'Choose a new password | LEAP LIVING',
  // The token is in the address: do not send it to other sites in the Referer header.
  referrer: 'no-referrer',
}

type Search = Promise<Record<string, string | string[] | undefined>>

export default async function ResetPasswordPage({ searchParams }: { searchParams: Search }) {
  const raw = (await searchParams).token
  const token = (Array.isArray(raw) ? raw[0] : raw) ?? ''
  const usable = await resetTokenUsable(token)
  return (
    <AuthShell
      title={usable ? 'Choose a new password' : 'This link is no longer valid'}
      intro={
        usable ? (
          <p>Once saved, you&apos;ll be signed in here and signed out on your other devices.</p>
        ) : (
          <p>Reset links work once and expire after 1 hour. Request a new one below.</p>
        )
      }
      footer={
        <Link href="/account/sign-in" className="ll-acc-link">
          Back to sign in
        </Link>
      }
    >
      {usable ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Link href="/account/forgot-password" className="ll-btn ll-btn-primary ll-acc-submit">
          Send a new link
        </Link>
      )}
    </AuthShell>
  )
}
