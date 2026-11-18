import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCustomer } from '@/server/auth/account'
import { getActor } from '@/server/auth/current'
import { parseFavoriteKey, safeNextPath } from '@/modules/customers'
import { AuthShell } from '@/components/account/auth-shell'
import { CookieBlockedNotice, SignInForm } from '@/components/account/account-forms'

export const metadata: Metadata = { title: 'Sign in | LEAP LIVING' }

type Search = Promise<Record<string, string | string[] | undefined>>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export default async function SignInPage({ searchParams }: { searchParams: Search }) {
  const query = await searchParams
  const next = safeNextPath(one(query.next))
  const save = parseFavoriteKey(one(query.save)) ? one(query.save) : ''
  // Already signed in as a team member: straight to the admin (visitors: back where they were).
  const actor = await getActor()
  if (actor) redirect(actor.mustChangePassword ? '/admin/change-password' : '/admin')
  if (await getCustomer()) redirect(next)

  const carry = new URLSearchParams({
    ...(next !== '/account' ? { next } : {}),
    ...(save ? { save } : {}),
  }).toString()

  return (
    <AuthShell
      title="Welcome back"
      intro={
        one(query.deleted) === '1' ? (
          <p className="ll-acc-alert ll-acc-alert--ok" role="status">
            Your account and saved items have been deleted.
          </p>
        ) : save ? (
          <p>Sign in or create a free account to add this to your shortlist.</p>
        ) : (
          <p>Sign in to see your shortlist and follow your requests.</p>
        )
      }
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href={`/account/sign-up${carry ? `?${carry}` : ''}`} className="ll-acc-link">
            Create a free account
          </Link>
        </>
      }
    >
      <CookieBlockedNotice />
      <SignInForm next={next} save={save} />
    </AuthShell>
  )
}
