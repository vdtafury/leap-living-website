'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { startTransition, useActionState, type FormEvent, type ReactNode } from 'react'
import type { ActionState } from '../_lib/guard'

type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>

/**
 * useActionState without React 19's automatic form reset: after a failed save the person keeps
 * what they typed. `action` stays on the <form> so it also works before JavaScript loads
 * (progressive enhancement); with JavaScript, onSubmit sends the same FormData in a transition.
 */
export function useActionForm(action: FormAction) {
  const [state, dispatch, pending] = useActionState(action, null)
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const data = new FormData(event.currentTarget, submitter)
    startTransition(() => dispatch(data))
  }
  return { state, pending, formProps: { action: dispatch, onSubmit } }
}

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname()
  const active = href === '/admin' ? pathname === href : pathname.startsWith(href)
  return (
    <Link href={href} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  )
}

export function SubmitButton({
  children,
  className = 'adm-btn',
  confirm,
  name,
  value,
  pending,
}: {
  children: ReactNode
  className?: string
  /** Asks before submitting (destructive actions) */
  confirm?: string
  name?: string
  value?: string
  /** From useActionForm (useFormStatus does not see transitions started in onSubmit) */
  pending?: boolean
}) {
  const status = useFormStatus()
  const busy = pending ?? status.pending
  return (
    <button
      type="submit"
      className={className}
      disabled={busy}
      aria-busy={busy || undefined}
      name={name}
      value={value}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault()
      }}
    >
      {children}
    </button>
  )
}
