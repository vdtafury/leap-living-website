import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { createRateLimiter } from '@/server/rate-limit'
import {
  hashPassword,
  passwordProblem,
  timingDummyHash,
  verifyPassword,
} from '@/server/auth/password'
import {
  ACCOUNT_ABSOLUTE_MS,
  ACCOUNT_IDLE_MS,
  hashSessionToken,
  newSessionToken,
  sessionState,
  shouldTouch,
} from '@/server/auth/session-token'
import { SITE_URL } from '@/lib/seo'
import { recordAudit } from '@/modules/audit-logs'
import {
  ACCOUNT_EMAIL,
  processOutbox,
  queueEmail,
  unlinkCustomerInquiries,
} from '@/modules/inquiries'
import type { RequestInfo } from '@/modules/users'
import { deleteCustomerReview } from '@/modules/reviews'
import {
  emailSchema,
  firstName,
  profileSchema,
  signUpSchema,
  type ProfileInput,
  type SignUpInput,
} from '../domain/account'

/* ------------------------------------------------------------------ limits */

export const MAX_FAILED_SIGNINS = 5
export const SIGNIN_LOCK_MS = 15 * 60 * 1000
/** Older sessions beyond this many per account are ended (oldest first). */
const MAX_SESSIONS = 10
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000
const RESET_TTL_MS = 60 * 60 * 1000
/** Per account per hour, for each kind of one-time link email. */
const LINK_EMAILS_PER_HOUR = 3

const signUpsPerIp = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })
const signInsPerIp = createRateLimiter({ limit: 20, windowMs: 15 * 60 * 1000 })
const resetsPerIp = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 })

const sendSoon = () =>
  processOutbox().catch((error) => console.error('[outbox] send after account email failed', error))

const audit = (
  action: string,
  customerId: string | undefined,
  ipHash: string | null,
  metadata?: Record<string, unknown>,
) =>
  // Website accounts are not staff: no actor, the account is the target. No email or name in
  // the log (SECURITY.md §7: identify the target, nothing more).
  recordAudit({
    action,
    targetType: customerId ? 'Customer' : undefined,
    targetId: customerId,
    ipHash,
    metadata,
  })

/* ------------------------------------------------------------------ sessions */

export interface CustomerActor {
  id: string
  email: string
  name: string
  phone: string
  emailVerified: boolean
  sessionId: string
}

async function createSession(customerId: string, info: RequestInfo): Promise<string> {
  const token = newSessionToken()
  const now = Date.now()
  await prisma.customerSession.create({
    data: {
      id: hashSessionToken(token),
      customerId,
      lastSeenAt: new Date(now),
      expiresAt: new Date(now + ACCOUNT_ABSOLUTE_MS),
      ipHash: info.ipHash,
      userAgent: info.userAgent?.slice(0, 300) ?? null,
    },
  })
  const sessions = await prisma.customerSession.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  if (sessions.length > MAX_SESSIONS) {
    await prisma.customerSession.deleteMany({
      where: { id: { in: sessions.slice(MAX_SESSIONS).map((s) => s.id) } },
    })
  }
  return token
}

/** The signed-in website account for a cookie token, or null (expired sessions are deleted). */
export async function customerFromSessionToken(
  token: string | undefined,
): Promise<CustomerActor | null> {
  if (!token || token.length > 100) return null
  await ensureReady()
  const id = hashSessionToken(token)
  const session = await prisma.customerSession.findUnique({ where: { id } })
  if (!session) return null
  if (sessionState(session, Date.now(), ACCOUNT_IDLE_MS) !== 'valid') {
    await prisma.customerSession.delete({ where: { id } }).catch(() => undefined)
    return null
  }
  const customer = await prisma.customer.findUnique({ where: { id: session.customerId } })
  if (!customer || !customer.isActive) return null
  if (shouldTouch(session.lastSeenAt)) {
    await prisma.customerSession.update({ where: { id }, data: { lastSeenAt: new Date() } })
  }
  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    phone: customer.phone,
    emailVerified: customer.emailVerifiedAt !== null,
    sessionId: id,
  }
}

/* ------------------------------------------------------------------ one-time links */

type LinkPurpose = 'VERIFY_EMAIL' | 'RESET_PASSWORD'
type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

function linkEmail(purpose: LinkPurpose, name: string, url: string) {
  const hello = `Hello ${firstName(name) || 'there'},`
  if (purpose === 'VERIFY_EMAIL') {
    return {
      subject: 'Confirm your email for your LEAP LIVING account',
      text: [
        hello,
        '',
        'Thank you for creating a LEAP LIVING account. Please confirm your email address by opening this link:',
        url,
        '',
        'The link works for 48 hours. If you did not create this account, you can ignore this email.',
        '',
        'LEAP LIVING',
      ].join('\n'),
    }
  }
  return {
    subject: 'Reset your LEAP LIVING password',
    text: [
      hello,
      '',
      'Someone asked to reset the password of your LEAP LIVING account. To choose a new password, open this link:',
      url,
      '',
      'The link works for 1 hour and only once. If you did not ask for this, ignore this email: your password stays the same.',
      '',
      'LEAP LIVING',
    ].join('\n'),
  }
}

/** Creates the token row and queues the email with the link, in the caller's transaction. */
async function queueLink(
  tx: Tx,
  customer: { id: string; email: string; name: string },
  purpose: LinkPurpose,
) {
  const token = newSessionToken()
  const ttl = purpose === 'VERIFY_EMAIL' ? VERIFY_TTL_MS : RESET_TTL_MS
  await tx.customerToken.create({
    data: {
      id: hashSessionToken(token),
      customerId: customer.id,
      purpose,
      expiresAt: new Date(Date.now() + ttl),
    },
  })
  const path = purpose === 'VERIFY_EMAIL' ? '/account/verify' : '/account/reset-password'
  const email = linkEmail(purpose, customer.name, `${SITE_URL}${path}?token=${token}`)
  await queueEmail({ to: customer.email, ...email, relatedType: ACCOUNT_EMAIL }, tx)
}

async function recentLinks(customerId: string, purpose: LinkPurpose) {
  return prisma.customerToken.count({
    where: { customerId, purpose, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
  })
}

/** A usable token row for `token`, or null (unknown, used, expired, wrong purpose). */
async function findToken(token: unknown, purpose: LinkPurpose) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 100) return null
  const row = await prisma.customerToken.findUnique({ where: { id: hashSessionToken(token) } })
  if (!row || row.purpose !== purpose || row.usedAt || row.expiresAt.getTime() <= Date.now()) {
    return null
  }
  return row
}

/* ------------------------------------------------------------------ sign up / in / out */

export type AuthResult =
  | { ok: true; token: string; customerId: string }
  | { ok: false; error: string; fields?: Record<string, string> }

const firstIssues = (issues: { path: PropertyKey[]; message: string }[]) => {
  const out: Record<string, string> = {}
  for (const issue of issues) out[String(issue.path[0] ?? 'form')] ??= issue.message
  return out
}

export async function signUp(input: SignUpInput, info: RequestInfo): Promise<AuthResult> {
  await ensureReady()
  const parsed = signUpSchema.safeParse(input)
  // Every problem at once, password included, so the form shows them all in one go.
  const problem = passwordProblem(String(input.password ?? ''))
  if (!parsed.success || problem) {
    const fields: Record<string, string> = parsed.success ? {} : firstIssues(parsed.error.issues)
    if (problem) fields.password ??= problem
    return { ok: false, error: 'Check the highlighted fields.', fields }
  }
  const { name, email, phone, password } = parsed.data

  const limit = signUpsPerIp.hit(info.ipKey)
  if (!limit.ok) return { ok: false, error: 'Too many new accounts from here. Try again later.' }

  // Saying that the email is taken tells a visitor the address has an account. That is the
  // usual trade-off for a sign-up that works at once (D-40); the per-IP limit above slows
  // anyone trying to list addresses.
  if (await prisma.customer.findUnique({ where: { email }, select: { id: true } })) {
    return {
      ok: false,
      error: 'An account with this email already exists. Sign in, or reset your password.',
      fields: { email: 'This email already has an account.' },
    }
  }

  const passwordHash = await hashPassword(password)
  let customerId: string
  try {
    customerId = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: { email, name, phone, passwordHash, lastLoginAt: new Date() },
      })
      await queueLink(tx, customer, 'VERIFY_EMAIL')
      return customer.id
    })
  } catch (error) {
    // Two sign-ups with the same email at the same moment: the unique index decides.
    if (String(error).includes('Unique constraint')) {
      return { ok: false, error: 'An account with this email already exists. Sign in instead.' }
    }
    throw error
  }
  sendSoon()
  await audit('account.created', customerId, info.ipHash)
  return { ok: true, token: await createSession(customerId, info), customerId }
}

/** Generic outcome: unknown email and wrong password give the same message. */
export async function signIn(
  input: { email: string; password: string },
  info: RequestInfo,
): Promise<AuthResult> {
  await ensureReady()
  const email = String(input.email ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 254)
  const password = String(input.password ?? '').slice(0, 256)
  const invalid = { ok: false as const, error: 'Wrong email or password.' }
  const locked = { ok: false as const, error: 'Too many attempts. Try again in 15 minutes.' }

  if (signInsPerIp.blocked(info.ipKey)) return locked

  const customer = email ? await prisma.customer.findUnique({ where: { email } }) : null
  const now = Date.now()

  if (!customer || !customer.isActive) {
    await verifyPassword(await timingDummyHash(), password) // same cost as a real check
    signInsPerIp.hit(info.ipKey)
    await audit('account.login_failed', customer?.id, info.ipHash, {
      reason: customer ? 'inactive' : 'unknown_email',
    })
    return invalid
  }

  if (customer.lockedUntil && customer.lockedUntil.getTime() > now) {
    await audit('account.login_blocked', customer.id, info.ipHash)
    return locked
  }

  if (!(await verifyPassword(customer.passwordHash, password))) {
    signInsPerIp.hit(info.ipKey)
    const failed = customer.failedLogins + 1
    const lock = failed >= MAX_FAILED_SIGNINS
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        failedLogins: lock ? 0 : failed,
        lockedUntil: lock ? new Date(now + SIGNIN_LOCK_MS) : customer.lockedUntil,
      },
    })
    await audit(lock ? 'account.locked' : 'account.login_failed', customer.id, info.ipHash)
    return lock ? locked : invalid
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date(now) },
  })
  await prisma.customerSession.deleteMany({
    where: { customerId: customer.id, expiresAt: { lt: new Date(now) } },
  })
  await audit('account.login', customer.id, info.ipHash)
  return { ok: true, token: await createSession(customer.id, info), customerId: customer.id }
}

export async function signOut(actor: CustomerActor, ipHash: string | null): Promise<void> {
  await prisma.customerSession.delete({ where: { id: actor.sessionId } }).catch(() => undefined)
  await audit('account.logout', actor.id, ipHash)
}

/* ------------------------------------------------------------------ profile and password */

export async function updateProfile(
  actor: CustomerActor,
  input: ProfileInput,
): Promise<{ ok: true } | { ok: false; error: string; fields?: Record<string, string> }> {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Check the highlighted fields.',
      fields: firstIssues(parsed.error.issues),
    }
  }
  await prisma.customer.update({ where: { id: actor.id }, data: parsed.data })
  await audit('account.profile_updated', actor.id, null)
  return { ok: true }
}

/** Own password. Ends every session of the account and returns a fresh one. */
export async function changePassword(
  actor: CustomerActor,
  input: { current: string; next: string },
  info: RequestInfo,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: actor.id } })
  if (!(await verifyPassword(customer.passwordHash, input.current.slice(0, 256)))) {
    await audit('account.password_change_failed', actor.id, info.ipHash)
    return { ok: false, error: 'The current password is incorrect.' }
  }
  if (input.next === input.current) return { ok: false, error: 'Choose a new password.' }
  const problem = passwordProblem(input.next)
  if (problem) return { ok: false, error: problem }

  const passwordHash = await hashPassword(input.next)
  await prisma.$transaction([
    prisma.customer.update({ where: { id: actor.id }, data: { passwordHash } }),
    prisma.customerSession.deleteMany({ where: { customerId: actor.id } }),
  ])
  await audit('account.password_changed', actor.id, info.ipHash)
  return { ok: true, token: await createSession(actor.id, info) }
}

/* ------------------------------------------------------------------ email confirmation */

export async function resendVerification(
  actor: CustomerActor,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (actor.emailVerified) return { ok: false, error: 'Your email is already confirmed.' }
  if ((await recentLinks(actor.id, 'VERIFY_EMAIL')) >= LINK_EMAILS_PER_HOUR) {
    return { ok: false, error: 'We sent several links already. Try again in an hour.' }
  }
  await prisma.$transaction((tx) => queueLink(tx, actor, 'VERIFY_EMAIL'))
  sendSoon()
  await audit('account.verification_sent', actor.id, null)
  return { ok: true }
}

/** Opening the link confirms the email. Safe to open twice (the second time says so). */
export async function verifyEmail(
  token: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await ensureReady()
  const row = await findToken(token, 'VERIFY_EMAIL')
  if (!row) return { ok: false, error: 'This link is invalid, used or expired.' }
  const now = new Date()
  await prisma.$transaction([
    prisma.customerToken.updateMany({
      where: { customerId: row.customerId, purpose: 'VERIFY_EMAIL', usedAt: null },
      data: { usedAt: now },
    }),
    prisma.customer.update({ where: { id: row.customerId }, data: { emailVerifiedAt: now } }),
  ])
  await audit('account.email_verified', row.customerId, null)
  return { ok: true }
}

/* ------------------------------------------------------------------ password reset */

/**
 * Always the same answer, whether or not the email has an account (no account discovery).
 * The email itself waits in the outbox until SMTP is configured.
 */
export async function requestPasswordReset(email: unknown, info: RequestInfo): Promise<void> {
  await ensureReady()
  const parsed = emailSchema.safeParse(email)
  if (!parsed.success) return
  if (!resetsPerIp.hit(info.ipKey).ok) return
  const customer = await prisma.customer.findUnique({ where: { email: parsed.data } })
  if (!customer || !customer.isActive) {
    await audit('account.password_reset_requested', undefined, info.ipHash, { known: false })
    return
  }
  if ((await recentLinks(customer.id, 'RESET_PASSWORD')) >= LINK_EMAILS_PER_HOUR) return
  await prisma.$transaction((tx) => queueLink(tx, customer, 'RESET_PASSWORD'))
  sendSoon()
  await audit('account.password_reset_requested', customer.id, info.ipHash, { known: true })
}

/** Whether a reset link can still be used (the page shows the form only then). */
export async function resetTokenUsable(token: unknown): Promise<boolean> {
  await ensureReady()
  return (await findToken(token, 'RESET_PASSWORD')) !== null
}

/**
 * New password from a reset link: single use, ends every session, clears a lockout, and signs
 * this browser in. Opening the link proves the mailbox, so the email counts as confirmed.
 */
export async function resetPassword(
  token: unknown,
  password: string,
  info: RequestInfo,
): Promise<AuthResult> {
  await ensureReady()
  const row = await findToken(token, 'RESET_PASSWORD')
  if (!row) return { ok: false, error: 'This link is invalid, used or expired. Ask for a new one.' }
  const customer = await prisma.customer.findUnique({ where: { id: row.customerId } })
  if (!customer || !customer.isActive) return { ok: false, error: 'This link is invalid.' }
  const problem = passwordProblem(password)
  if (problem) return { ok: false, error: problem, fields: { password: problem } }

  const passwordHash = await hashPassword(password)
  const now = new Date()
  const claimed = await prisma.$transaction(async (tx) => {
    // Conditional claim: two tabs submitting the same link cannot both succeed.
    const claim = await tx.customerToken.updateMany({
      where: { id: row.id, usedAt: null },
      data: { usedAt: now },
    })
    if (claim.count !== 1) return false
    await tx.customerToken.updateMany({
      where: { customerId: customer.id, purpose: 'RESET_PASSWORD', usedAt: null },
      data: { usedAt: now },
    })
    await tx.customer.update({
      where: { id: customer.id },
      data: {
        passwordHash,
        failedLogins: 0,
        lockedUntil: null,
        lastLoginAt: now,
        emailVerifiedAt: customer.emailVerifiedAt ?? now,
      },
    })
    await tx.customerSession.deleteMany({ where: { customerId: customer.id } })
    return true
  })
  if (!claimed) return { ok: false, error: 'This link was already used. Ask for a new one.' }
  await audit('account.password_reset', customer.id, info.ipHash)
  return { ok: true, token: await createSession(customer.id, info), customerId: customer.id }
}

/* ------------------------------------------------------------------ deletion */

/**
 * Deletes the account and everything that belongs only to it (sessions, links, saved items).
 * Requests sent to the company stay in its records, unlinked from the account.
 */
export async function deleteAccount(
  actor: CustomerActor,
  password: string,
  info: RequestInfo,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: actor.id } })
  if (!(await verifyPassword(customer.passwordHash, password.slice(0, 256)))) {
    return { ok: false, error: 'The password is incorrect. Nothing was deleted.' }
  }
  await prisma.$transaction(async (tx) => {
    await tx.favorite.deleteMany({ where: { customerId: actor.id } })
    await tx.customerToken.deleteMany({ where: { customerId: actor.id } })
    await tx.customerSession.deleteMany({ where: { customerId: actor.id } })
    await unlinkCustomerInquiries(actor.id, tx)
    // Their review (published or not) goes with the account (D-44).
    await deleteCustomerReview(actor.id, tx)
    await tx.customer.delete({ where: { id: actor.id } })
    await recordAudit(
      {
        action: 'account.deleted',
        targetType: 'Customer',
        targetId: actor.id,
        ipHash: info.ipHash,
      },
      tx,
    )
  })
  return { ok: true }
}
