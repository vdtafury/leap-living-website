import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCustomer } from '@/server/auth/account'
import { parseFavoriteKey, safeNextPath } from '@/modules/customers'
import { AuthShell } from '@/components/account/auth-shell'
import { SignInForm } from '@/components/account/account-forms'

export const metadata: Metadata = { title: 'Sign in | LEAP LIVING' }

type Search = Promise<Record<string, string | string[] | undefined>>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export default async function SignInPage({ searchParams }: { searchParams: Search }) {
  const query = await searchParams
  const next = safeNextPath(one(query.next))
  const save = parseFavoriteKey(one(query.save)) ? one(query.save) : ''
  if (await getCustomer()) redirect(next)

  const carry = new URLSearchParams({
    ...(next !== '/account' ? { next } : {}),
    ...(save ? { save } : {}),
  }).toString()

  return (
    <AuthShell
      title="Sign in"
      intro={
        one(query.deleted) === '1' ? (
          <p className="ll-acc-alert ll-acc-alert--ok" role="status">
            Your account was deleted.
          </p>
        ) : save ? (
          <p>Sign in to save this listing to your account.</p>
        ) : (
          <p>Welcome back. Sign in to see your saved properties and requests.</p>
        )
      }
      footer={
        <>
          New to LEAP LIVING?{' '}
          <Link href={`/account/sign-up${carry ? `?${carry}` : ''}`} className="ll-acc-link">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm next={next} save={save} />
    </AuthShell>
  )
}
