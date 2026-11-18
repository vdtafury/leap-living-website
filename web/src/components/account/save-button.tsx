'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { HeartIcon } from '@/components/ui/icons'
import { useAccount } from './account-provider'

type ItemType = 'PROPERTY' | 'PROJECT'

/** Sign-in link that comes back to this page and saves the item once signed in. */
function signInHref(returnTo: string, key: string) {
  const params = new URLSearchParams({ next: returnTo, save: key })
  return `/account/sign-in?${params.toString()}`
}

/**
 * Heart toggle for a property or project (D-40).
 * - `card`: round glass button on the card photo.
 * - `detail`: labelled pill ("Save" / "Saved") in the detail page header.
 * Signed out, it goes to sign-in and the item is saved right after.
 */
export function SaveButton({
  type,
  id,
  title,
  variant = 'card',
}: {
  type: ItemType
  id?: string
  title: string
  variant?: 'card' | 'detail'
}) {
  const { account, isSaved, toggle } = useAccount()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (!id) return null

  const key = `${type}:${id}`
  const saved = Boolean(account) && isSaved(key)
  const label = saved ? `Remove ${title} from saved` : `Save ${title}`

  const onClick = async () => {
    setError(null)
    const returnTo = `${window.location.pathname}${window.location.search}`
    if (!account) {
      router.push(signInHref(returnTo, key))
      return
    }
    setBusy(true)
    const result = await toggle(key)
    setBusy(false)
    if (result.signedOut) router.push(signInHref(returnTo, key))
    else if (result.error) setError(result.error)
  }

  let content: ReactNode = <HeartIcon size={variant === 'card' ? 18 : 17} filled={saved} />
  if (variant === 'detail') {
    content = (
      <>
        {content}
        <span>{saved ? 'Saved' : 'Save'}</span>
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        className={`ll-save-btn ll-save-btn--${variant}${saved ? ' is-saved' : ''}`}
        aria-pressed={saved}
        aria-label={label}
        title={saved ? 'Saved to your account' : 'Save to your account'}
        disabled={busy}
        onClick={onClick}
      >
        {content}
      </button>
      {error && (
        <span className={`ll-save-error ll-save-error--${variant}`} role="alert">
          {error}
        </span>
      )}
    </>
  )
}
