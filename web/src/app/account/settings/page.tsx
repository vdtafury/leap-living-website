import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { accountCsrfToken, getCustomer } from '@/server/auth/account'
import {
  ChangePasswordForm,
  DeleteAccountForm,
  ProfileForm,
} from '@/components/account/account-forms'
import { ChevronRightIcon } from '@/components/ui/icons'

export const metadata: Metadata = { title: 'Account settings | LEAP LIVING' }

export default async function AccountSettingsPage() {
  const customer = await getCustomer()
  if (!customer) redirect('/account/sign-in?next=/account/settings')
  const csrf = accountCsrfToken(customer)

  return (
    <>
      <section className="ll-acc-hero">
        <div className="ll-container">
          <div className="ll-acc-crumbs">
            <Link href="/account">My account</Link>
            <ChevronRightIcon size={13} />
            <span>Settings</span>
          </div>
          <h1 className="ll-acc-hero-title">Account settings</h1>
        </div>
      </section>

      <div className="ll-container ll-acc-body ll-acc-settings">
        <section className="ll-acc-panel" aria-labelledby="profile-title">
          <h2 id="profile-title">Your details</h2>
          <p className="ll-acc-panel-lead">Used to fill in your requests to us.</p>
          <ProfileForm
            csrf={csrf}
            name={customer.name}
            phone={customer.phone}
            email={customer.email}
            verified={customer.emailVerified}
          />
        </section>

        <section className="ll-acc-panel" aria-labelledby="password-title">
          <h2 id="password-title">Password</h2>
          <p className="ll-acc-panel-lead">Changing it signs you out on every other device.</p>
          <ChangePasswordForm csrf={csrf} />
        </section>

        <section className="ll-acc-panel ll-acc-panel--danger" aria-labelledby="delete-title">
          <h2 id="delete-title">Delete account</h2>
          <p className="ll-acc-panel-lead">
            Deletes your account and saved items for good. Requests you already sent stay with our
            team so we can answer them.
          </p>
          <DeleteAccountForm csrf={csrf} />
        </section>
      </div>
    </>
  )
}
