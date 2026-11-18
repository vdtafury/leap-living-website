import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCustomer } from '@/server/auth/account'
import { parseFavoriteKey, safeNextPath } from '@/modules/customers'
import { AuthShell } from '@/components/account/auth-shell'
import { SignUpForm } from '@/components/account/account-forms'

export const metadata: Metadata = { title: 'Create an account | LEAP LIVING' }

type Search = Promise<Record<string, string | string[] | undefined>>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export default async function SignUpPage({ searchParams }: { searchParams: Search }) {
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
      title="Create your account"
      intro={<p>It takes a minute. You can start saving properties straight away.</p>}
      footer={
        <>
          Already have an account?{' '}
          <Link href={`/account/sign-in${carry ? `?${carry}` : ''}`} className="ll-acc-link">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm next={next} save={save} />
    </AuthShell>
  )
}
