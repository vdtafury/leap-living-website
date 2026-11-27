'use client'

import { useEffect, useState } from 'react'
import { CheckIcon, ShareIcon } from '@/components/ui/icons'

/**
 * Share the listing: the phone's share sheet where there is one, otherwise the link is
 * copied and the button says so for a moment.
 */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2200)
    return () => window.clearTimeout(timer)
  }, [copied])

  const share = async () => {
    const url = window.location.href.split('#')[0]
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        // Closing the share sheet is not an error worth a fallback.
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  return (
    <button type="button" className="ll-pd-share" onClick={share}>
      {copied ? <CheckIcon size={16} /> : <ShareIcon size={16} />}
      <span aria-live="polite">{copied ? 'Link copied' : 'Share'}</span>
    </button>
  )
}
