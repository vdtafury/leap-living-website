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
      title={usable ? 'Choose a new password' : 'This link does not work'}
      intro={
        usable ? (
          <p>After saving, you are signed in and signed out everywhere else.</p>
        ) : (
          <p>The link is invalid, was already used, or is older than 1 hour. Ask for a new one.</p>
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
