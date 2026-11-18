import Link from 'next/link'
import type { Metadata } from 'next'
import { verifyEmail } from '@/modules/customers'
import { getCustomer } from '@/server/auth/account'
import { AuthShell } from '@/components/account/auth-shell'

export const metadata: Metadata = {
  title: 'Confirm your email | LEAP LIVING',
  referrer: 'no-referrer',
}

type Search = Promise<Record<string, string | string[] | undefined>>

/** Opening the emailed link confirms the address (single use, harmless if opened twice). */
export default async function VerifyPage({ searchParams }: { searchParams: Search }) {
  const raw = (await searchParams).token
  const result = await verifyEmail(Array.isArray(raw) ? raw[0] : raw)
  const signedIn = Boolean(await getCustomer())
  return (
    <AuthShell
      title={result.ok ? 'Email confirmed' : 'This link is no longer valid'}
      intro={
        <p>
          {result.ok
            ? 'Thanks, your email address is confirmed.'
            : 'Confirmation links work once and expire after 48 hours. If your email isn’t confirmed yet, you can send a new link from your account page.'}
        </p>
      }
    >
      <Link
        href={signedIn ? '/account' : '/account/sign-in'}
        className="ll-btn ll-btn-primary ll-acc-submit"
      >
        {signedIn ? 'Go to my account' : 'Sign in'}
      </Link>
    </AuthShell>
  )
}
