import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { accountCsrfToken, getCustomer } from '@/server/auth/account'
import { firstName, listFavoriteItems } from '@/modules/customers'
import { listCustomerInquiries } from '@/modules/inquiries'
import { SavedListings } from '@/components/account/saved-listings'
import { ResendVerificationButton, SignOutButton } from '@/components/account/account-forms'
import { MailIcon } from '@/components/ui/icons'

export const metadata: Metadata = { title: 'My account | LEAP LIVING' }

type Search = Promise<Record<string, string | string[] | undefined>>

/** Stored in UTC, shown in Dubai time. */
const dubaiDate = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Dubai',
})

export default async function AccountPage({ searchParams }: { searchParams: Search }) {
  const customer = await getCustomer()
  if (!customer) redirect('/account/sign-in')
  const query = await searchParams
  const [saved, requests] = await Promise.all([
    listFavoriteItems(customer.id),
    listCustomerInquiries(customer.id),
  ])
  const csrf = accountCsrfToken(customer)

  return (
    <>
      <section className="ll-acc-hero">
        <div className="ll-container ll-acc-hero-inner">
          <div>
            <div className="ll-acc-eyebrow">My account</div>
            <h1 className="ll-acc-hero-title">Hello, {firstName(customer.name)}</h1>
            <p className="ll-acc-hero-sub">{customer.email}</p>
          </div>
          <div className="ll-acc-hero-actions">
            <Link href="/account/settings" className="ll-btn ll-btn-outline">
              Account settings
            </Link>
            <SignOutButton csrf={csrf} />
          </div>
        </div>
      </section>

      <div className="ll-container ll-acc-body">
        {query.reset === '1' && (
          <div className="ll-acc-alert ll-acc-alert--ok" role="status">
            Your new password is saved and you are signed in.
          </div>
        )}
        {!customer.emailVerified && (
          <div className="ll-acc-banner" role="note">
            <MailIcon size={18} />
            <p>
              Please confirm your email: we sent a link to <strong>{customer.email}</strong>.
            </p>
            <ResendVerificationButton csrf={csrf} />
          </div>
        )}

        <nav className="ll-acc-tabs" aria-label="Account sections">
          <a href="#saved-properties">Saved properties</a>
          <a href="#saved-projects">Saved projects</a>
          <a href="#requests">My requests</a>
        </nav>

        <SavedListings properties={saved.properties} projects={saved.projects} />
        {saved.unavailable > 0 && (
          <p className="ll-acc-note">
            {saved.unavailable === 1
              ? '1 saved listing is no longer on the market, so it is hidden.'
              : `${saved.unavailable} saved listings are no longer on the market, so they are hidden.`}
          </p>
        )}

        <section id="requests" className="ll-acc-section" aria-labelledby="requests-title">
          <div className="ll-acc-section-head">
            <h2 id="requests-title">My requests</h2>
            <span className="ll-acc-count tabular-nums">{requests.length}</span>
          </div>
          {requests.length === 0 ? (
            <div className="ll-acc-empty">
              <span className="ll-acc-empty-icon" aria-hidden="true">
                <MailIcon size={20} />
              </span>
              <p>
                No requests yet. Viewing, valuation and consultation requests you send while signed
                in appear here, with their status.
              </p>
              <div className="ll-acc-empty-links">
                <Link href="/contact" className="ll-btn ll-btn-outline">
                  Contact us
                </Link>
              </div>
            </div>
          ) : (
            <ul className="ll-acc-requests">
              {requests.map((r) => (
                <li key={r.id} className="ll-acc-request">
                  <div className="ll-acc-request-main">
                    <span className="ll-acc-request-type">{r.type}</span>
                    <span className="ll-acc-request-about">
                      {r.context ? `${r.context} · ${r.interest}` : r.interest}
                    </span>
                  </div>
                  <time className="ll-acc-request-date" dateTime={r.createdAt.toISOString()}>
                    {dubaiDate.format(r.createdAt)}
                  </time>
                  <span
                    className={`ll-acc-status ll-acc-status--${r.status.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
