import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/account/auth-shell'
import { ForgotPasswordForm } from '@/components/account/account-forms'

export const metadata: Metadata = { title: 'Reset your password | LEAP LIVING' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      intro={
        <p>
          Enter the email you signed up with and we&apos;ll send you a link to choose a new
          password.
        </p>
      }
      footer={
        <Link href="/account/sign-in" className="ll-acc-link">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
