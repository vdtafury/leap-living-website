'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { clearSessionCookie, requestInfo, setSessionCookie } from '@/server/auth/current'
import { originAllowed } from '@/server/auth/csrf'
import {
  changeOwnPassword,
  createUser,
  login,
  logout,
  resetUserPassword,
  setUserActive,
  setUserRole,
} from '@/modules/users'
import {
  createProject,
  createProperty,
  deleteProject,
  deleteProperty,
  PUBLICATION_STATUSES,
  setProjectPublication,
  setPropertyPublication,
  updateProject,
  updateProperty,
  type PublicationStatus,
} from '@/modules/listings'
import {
  discardDraft,
  isDocumentKey,
  publishContent,
  restoreRevision,
  saveDraft,
} from '@/modules/content'
import { deleteDeveloper, moveDeveloper, saveDeveloper } from '@/modules/developers'
import { retryOutbox, setInquiryStatus } from '@/modules/inquiries'
import { setCustomerActive } from '@/modules/customers'
import { deleteMedia } from '@/modules/media'
import { backTo, guarded, jsonField, text, withMessage, type ActionState } from './_lib/guard'

/* ------------------------------------------------------------------ sign-in */

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Login has no session yet, so no CSRF token: the Origin check stops cross-site posts.
  if (!originAllowed(await headers())) return { error: 'Request blocked. Reload the page.' }
  const result = await login(
    { username: text(formData, 'username'), password: text(formData, 'password') },
    await requestInfo(),
  )
  if (!result.ok) {
    return {
      error:
        result.reason === 'locked'
          ? 'Too many attempts. Try again in 15 minutes.'
          : 'Wrong username or password.',
    }
  }
  await setSessionCookie(result.token)
  const target = result.mustChangePassword ? '/admin/change-password' : '/admin'
  // With JavaScript the form does a full page load to the target, so the next request shows
  // whether the browser kept the cookie (a server redirect would render the target in this
  // same response and hide a blocked cookie). Without JavaScript: a normal redirect.
  if (text(formData, 'js') === '1') return { redirectTo: target }
  redirect(target)
}

export async function logoutAction(formData: FormData) {
  const result = await guarded(
    formData,
    async (actor) => logout(actor, (await requestInfo()).ipHash),
    { allowPasswordChange: true },
  )
  if (!result.ok) redirect(withMessage('/admin', 'error', result.error))
  await clearSessionCookie()
  redirect('/admin/login')
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (text(formData, 'next') !== text(formData, 'confirm')) {
    return { error: 'The new passwords do not match.' }
  }
  const result = await guarded(
    formData,
    async (actor) =>
      changeOwnPassword(
        actor,
        { current: text(formData, 'current'), next: text(formData, 'next') },
        await requestInfo(),
      ),
    { allowPasswordChange: true },
  )
  if (!result.ok) return { error: result.error }
  if (!result.value.ok) return { error: result.value.error }
  await setSessionCookie(result.value.token)
  redirect(withMessage('/admin', 'ok', 'Password changed.'))
}

/* ------------------------------------------------------------------ listings */

function listingInput(formData: FormData) {
  const lines = (key: string) =>
    text(formData, key)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  return {
    title: text(formData, 'title'),
    subtitle: text(formData, 'subtitle'),
    slug: text(formData, 'slug'),
    referenceNumber: text(formData, 'referenceNumber'),
    featured: formData.get('featured') === 'on',
    sortOrder: text(formData, 'sortOrder') || '0',
    images: jsonField(formData, 'images', []),
    // property
    transactionType: text(formData, 'transactionType'),
    segment: text(formData, 'segment'),
    propertyType: text(formData, 'propertyType'),
    availabilityStatus: text(formData, 'availabilityStatus'),
    highlightLabel: text(formData, 'highlightLabel'),
    community: text(formData, 'community'),
    emirate: text(formData, 'emirate'),
    price: text(formData, 'price'),
    priceFrequency: text(formData, 'priceFrequency'),
    beds: text(formData, 'beds') || '0',
    baths: text(formData, 'baths') || '0',
    area: text(formData, 'area'),
    completionStatus: text(formData, 'completionStatus'),
    developer: text(formData, 'developer'),
    description: text(formData, 'description'),
    highlights: lines('highlights'),
    permitNumber: text(formData, 'permitNumber'),
    // project
    status: text(formData, 'status'),
    startingPrice: text(formData, 'startingPrice'),
    handoverLabel: text(formData, 'handoverLabel'),
    paymentPlan: text(formData, 'paymentPlan'),
    unitTypes: text(formData, 'unitTypes'),
    overview: text(formData, 'overview'),
    amenities: lines('amenities'),
    keyFacts: lines('keyFacts').map((line) => {
      const at = line.indexOf(':')
      return at > 0
        ? { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() }
        : { label: line, value: '' }
    }),
  }
}

export async function savePropertyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = text(formData, 'id')
  const result = await guarded(formData, (actor) =>
    id
      ? updateProperty(actor, id, listingInput(formData))
      : createProperty(actor, listingInput(formData)),
  )
  if (!result.ok) return { error: result.error }
  if (!result.value.ok) return { error: result.value.error }
  revalidatePath('/admin/properties')
  if (!id && 'id' in result.value) {
    redirect(withMessage(`/admin/properties/${result.value.id}`, 'ok', 'Draft created.'))
  }
  return { ok: 'Saved.' }
}

export async function saveProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = text(formData, 'id')
  const result = await guarded(formData, (actor) =>
    id
      ? updateProject(actor, id, listingInput(formData))
      : createProject(actor, listingInput(formData)),
  )
  if (!result.ok) return { error: result.error }
  if (!result.value.ok) return { error: result.value.error }
  revalidatePath('/admin/projects')
  if (!id && 'id' in result.value) {
    redirect(withMessage(`/admin/projects/${result.value.id}`, 'ok', 'Draft created.'))
  }
  return { ok: 'Saved.' }
}

const asStatus = (value: string): PublicationStatus | null =>
  (PUBLICATION_STATUSES as readonly string[]).includes(value) ? (value as PublicationStatus) : null

export async function listingStatusAction(formData: FormData) {
  const kind = text(formData, 'kind') === 'project' ? 'project' : 'property'
  const id = text(formData, 'id')
  const op = text(formData, 'op')
  const back = backTo(formData, `/admin/${kind === 'project' ? 'projects' : 'properties'}`)
  const result = await guarded(formData, async (actor) => {
    if (op === 'delete' || op === 'restore') {
      return kind === 'project'
        ? deleteProject(actor, id, op === 'restore')
        : deleteProperty(actor, id, op === 'restore')
    }
    const status = asStatus(op)
    if (!status) return { ok: false as const, error: 'Unknown action.' }
    return kind === 'project'
      ? setProjectPublication(actor, id, status)
      : setPropertyPublication(actor, id, status)
  })
  const error = !result.ok ? result.error : !result.value.ok ? result.value.error : null
  revalidatePath('/admin', 'layout')
  const messages: Record<string, string> = {
    PUBLISHED: 'Published: now visible on the site.',
    DRAFT: 'Unpublished: hidden from the site.',
    ARCHIVED: 'Archived: hidden from the site.',
    delete: 'Deleted.',
    restore: 'Restored as a draft.',
  }
  redirect(withMessage(back, error ? 'error' : 'ok', error ?? messages[op] ?? 'Done.'))
}

/* ------------------------------------------------------------------ content */

export async function saveContentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const key = text(formData, 'key')
  if (!isDocumentKey(key)) return { error: 'Unknown page.' }
  const result = await guarded(formData, (actor) =>
    saveDraft(actor, key, jsonField(formData, 'content', null)),
  )
  if (!result.ok) return { error: result.error }
  if (!result.value.ok) return { error: result.value.error }
  revalidatePath(`/admin/content/${key}`)
  return { ok: 'Draft saved. Preview it, then publish to make it live.' }
}

export async function contentStatusAction(formData: FormData) {
  const key = text(formData, 'key')
  const op = text(formData, 'op')
  const back = `/admin/content/${isDocumentKey(key) ? key : ''}`
  const result = await guarded(formData, async (actor) => {
    if (!isDocumentKey(key)) return { ok: false as const, error: 'Unknown page.' }
    if (op === 'publish') return publishContent(actor, key)
    if (op === 'discard') return discardDraft(actor, key)
    if (op === 'restore') return restoreRevision(actor, key, text(formData, 'revisionId'))
    return { ok: false as const, error: 'Unknown action.' }
  })
  const error = !result.ok ? result.error : !result.value.ok ? result.value.error : null
  revalidatePath('/admin', 'layout')
  const messages: Record<string, string> = {
    publish: 'Published: the site shows this version now.',
    discard: 'Draft discarded.',
    restore: 'That version is now the draft. Publish to make it live.',
  }
  redirect(withMessage(back, error ? 'error' : 'ok', error ?? messages[op] ?? 'Done.'))
}

/* ------------------------------------------------------------------ developers */

export async function developerAction(formData: FormData) {
  const op = text(formData, 'op')
  const id = text(formData, 'id') || null
  const result = await guarded(formData, async (actor) => {
    if (op === 'delete' && id) return deleteDeveloper(actor, id)
    if ((op === 'up' || op === 'down') && id) return moveDeveloper(actor, id, op === 'up' ? -1 : 1)
    return saveDeveloper(actor, id, {
      name: text(formData, 'name'),
      logoUrl: text(formData, 'logoUrl'),
      logoWidth: text(formData, 'logoWidth'),
      logoHeight: text(formData, 'logoHeight'),
      isVisible: formData.get('isVisible') === 'on',
      sortOrder: text(formData, 'sortOrder') || '0',
    })
  })
  const error = !result.ok ? result.error : !result.value.ok ? result.value.error : null
  revalidatePath('/admin/developers')
  const done =
    op === 'delete' ? 'Deleted.' : op === 'up' || op === 'down' ? 'Order updated.' : 'Saved.'
  redirect(withMessage('/admin/developers', error ? 'error' : 'ok', error ?? done))
}

/* ------------------------------------------------------------------ users */

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await guarded(formData, (actor) =>
    createUser(actor, {
      username: text(formData, 'username'),
      name: text(formData, 'name'),
      email: text(formData, 'email'),
      roleKey: text(formData, 'roleKey'),
      password: text(formData, 'password'),
    }),
  )
  if (!result.ok) return { error: result.error }
  if (!result.value.ok) return { error: result.value.error }
  revalidatePath('/admin/users')
  return { ok: 'User created. They must choose a new password at their first sign-in.' }
}

export async function userAction(formData: FormData) {
  const id = text(formData, 'id')
  const op = text(formData, 'op')
  const result = await guarded(formData, async (actor) => {
    if (op === 'activate' || op === 'deactivate') return setUserActive(actor, id, op === 'activate')
    if (op === 'role') return setUserRole(actor, id, text(formData, 'roleKey'))
    if (op === 'reset') return resetUserPassword(actor, id, text(formData, 'password'))
    return { ok: false as const, error: 'Unknown action.' }
  })
  const error = !result.ok ? result.error : !result.value.ok ? result.value.error : null
  revalidatePath('/admin/users')
  const messages: Record<string, string> = {
    activate: 'User activated.',
    deactivate: 'User deactivated and signed out.',
    role: 'Role changed.',
    reset: 'Temporary password set. The user must change it at the next sign-in.',
  }
  redirect(withMessage('/admin/users', error ? 'error' : 'ok', error ?? messages[op] ?? 'Done.'))
}

/* ------------------------------------------------------------------ website accounts (D-40) */

export async function customerAction(formData: FormData) {
  const back = backTo(formData, '/admin/customers')
  const op = text(formData, 'op')
  const result = await guarded(formData, (actor) =>
    op === 'activate' || op === 'deactivate'
      ? setCustomerActive(actor, text(formData, 'id'), op === 'activate')
      : Promise.resolve({ ok: false as const, error: 'Unknown action.' }),
  )
  const error = !result.ok ? result.error : !result.value.ok ? result.value.error : null
  revalidatePath('/admin/customers')
  const done = op === 'activate' ? 'Account reactivated.' : 'Account deactivated and signed out.'
  redirect(withMessage(back, error ? 'error' : 'ok', error ?? done))
}

/* ------------------------------------------------------------------ inquiries, outbox, media */

export async function inquiryStatusAction(formData: FormData) {
  const back = backTo(formData, '/admin/inquiries')
  const result = await guarded(formData, (actor) =>
    setInquiryStatus(actor, text(formData, 'id'), text(formData, 'status')),
  )
  const error = !result.ok ? result.error : !result.value.ok ? result.value.error : null
  redirect(withMessage(back, error ? 'error' : 'ok', error ?? 'Status updated.'))
}

export async function outboxRetryAction(formData: FormData) {
  const result = await guarded(formData, (actor) =>
    retryOutbox(actor, text(formData, 'id') || undefined),
  )
  const error = !result.ok ? result.error : !result.value.ok ? result.value.error : null
  const summary =
    result.ok && result.value.ok ? `Sent ${result.value.sent}, failed ${result.value.failed}.` : ''
  redirect(withMessage('/admin/outbox', error ? 'error' : 'ok', error ?? summary))
}

export async function deleteMediaAction(formData: FormData) {
  const result = await guarded(formData, (actor) => deleteMedia(actor, text(formData, 'id')))
  const error = !result.ok ? result.error : !result.value.ok ? result.value.error : null
  revalidatePath('/admin/media')
  redirect(withMessage('/admin/media', error ? 'error' : 'ok', error ?? 'Image deleted.'))
}
