'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { toggleFavoriteAction } from '@/app/account/actions'

export interface AccountSummary {
  name: string
  firstName: string
  email: string
  phone: string
}

interface AccountState {
  account: AccountSummary | null
  csrf: string
  savedCount: number
  isSaved: (key: string) => boolean
  /** Saves or removes an item; resolves to an error message, or null when it worked. */
  toggle: (key: string) => Promise<{ error: string | null; signedOut?: boolean }>
}

const AccountContext = createContext<AccountState>({
  account: null,
  csrf: '',
  savedCount: 0,
  isSaved: () => false,
  toggle: async () => ({ error: null, signedOut: true }),
})

/**
 * Website-account state for the whole page (D-40): who is signed in and which items are saved.
 * The root layout reads it on the server for every request, so the hearts and the header are
 * right on the first paint; a heart click updates it here at once and on the server after.
 */
export function AccountProvider({
  account,
  csrf,
  saved,
  children,
}: {
  account: AccountSummary | null
  csrf: string
  saved: string[]
  children: ReactNode
}) {
  const savedSig = saved.join('\0')
  const [prevSig, setPrevSig] = useState(savedSig)
  const [keys, setKeys] = useState(() => new Set(saved))
  if (savedSig !== prevSig) {
    setPrevSig(savedSig)
    setKeys(new Set(saved))
  }

  const set = useCallback((key: string, on: boolean) => {
    setKeys((prev) => {
      const next = new Set(prev)
      if (on) next.add(key)
      else next.delete(key)
      return next
    })
  }, [])

  const toggle = useCallback(
    async (key: string) => {
      if (!account) return { error: null, signedOut: true }
      const want = !keys.has(key)
      set(key, want) // optimistic
      try {
        const result = await toggleFavoriteAction(csrf, key, want)
        if (result.ok) {
          set(key, result.saved)
          return { error: null }
        }
        set(key, !want)
        return { error: result.error, signedOut: result.signedOut }
      } catch {
        set(key, !want)
        return { error: 'Could not save right now. Check your connection.' }
      }
    },
    [account, csrf, keys, set],
  )

  const value = useMemo<AccountState>(
    () => ({
      account,
      csrf,
      savedCount: keys.size,
      isSaved: (key) => keys.has(key),
      toggle,
    }),
    [account, csrf, keys, toggle],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export const useAccount = () => useContext(AccountContext)
