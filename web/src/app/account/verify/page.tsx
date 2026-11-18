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
      title={result.ok ? 'Email confirmed' : 'This link does not work'}
      intro={
        <p>
          {result.ok
            ? 'Thank you. Your email address is confirmed.'
            : 'The link is invalid, was already used, or has expired. If your email is not confirmed yet, you can ask for a new link on your account page.'}
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
