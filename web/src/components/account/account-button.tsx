'use client'

import Link from 'next/link'
import { UserIcon } from '@/components/ui/icons'
import { useAccount } from './account-provider'

/**
 * Header entry to website accounts (D-40). Signed out: a person icon to the sign-in page.
 * Signed in: the first letter of the name, with the number of saved items, to the account page.
 */
export function AccountButton({
  className = '',
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const { account, savedCount } = useAccount()
  if (!account) {
    return (
      <Link
        href="/account/sign-in"
        className={`ll-account-btn ${className}`}
        aria-label="Sign in or create an account"
        title="Sign in or create an account"
        onClick={onNavigate}
      >
        <UserIcon size={19} />
      </Link>
    )
  }
  const initial = (account.firstName || account.email).charAt(0).toUpperCase()
  const saved = savedCount > 0 ? `, ${savedCount} saved` : ''
  return (
    <Link
      href="/account"
      className={`ll-account-btn is-signed-in ${className}`}
      aria-label={`My account (${account.firstName || account.email}${saved})`}
      title="My account"
      onClick={onNavigate}
    >
      <span aria-hidden="true">{initial}</span>
      {savedCount > 0 && (
        <span className="ll-account-badge tabular-nums" aria-hidden="true">
          {savedCount > 99 ? '99+' : savedCount}
        </span>
      )}
    </Link>
  )
}

/** Full-width row for the mobile menu. */
export function AccountMenuLink({ onNavigate }: { onNavigate?: () => void }) {
  const { account, savedCount } = useAccount()
  return (
    <Link
      href={account ? '/account' : '/account/sign-in'}
      onClick={onNavigate}
      className="ll-mobile-nav-link ll-mobile-account-link"
    >
      <UserIcon size={18} />
      <span>
        {account
          ? `My account${savedCount ? ` · ${savedCount} saved` : ''}`
          : 'Sign in / Create account'}
      </span>
    </Link>
  )
}
