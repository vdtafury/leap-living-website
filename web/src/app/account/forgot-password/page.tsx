import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/account/auth-shell'
import { ForgotPasswordForm } from '@/components/account/account-forms'

export const metadata: Metadata = { title: 'Reset your password | LEAP LIVING' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      intro={
        <p>Enter the email of your account and we will send you a link to choose a new one.</p>
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
