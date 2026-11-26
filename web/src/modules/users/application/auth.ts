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
  hashSessionToken,
  newSessionToken,
  SESSION_ABSOLUTE_MS,
  sessionState,
  shouldTouch,
} from '@/server/auth/session-token'
import { recordAudit } from '@/modules/audit-logs'
import type { Actor } from '@/modules/authorization'

/* ------------------------------------------------------------------ sign-in and sessions */

const loginsPerIp = createRateLimiter({ limit: 20, windowMs: 15 * 60 * 1000 })
export const MAX_FAILED_LOGINS = 5
export const LOCK_MS = 15 * 60 * 1000

export type LoginResult =
  | { ok: true; token: string; mustChangePassword: boolean }
  | { ok: false; reason: 'invalid' | 'locked' }

export interface RequestInfo {
  ipKey: string
  ipHash: string | null
  userAgent: string | null
}

async function createSession(userId: string, info: RequestInfo): Promise<string> {
  const token = newSessionToken()
  const now = Date.now()
  await prisma.session.create({
    data: {
      id: hashSessionToken(token),
      userId,
      lastSeenAt: new Date(now),
      expiresAt: new Date(now + SESSION_ABSOLUTE_MS),
      ipHash: info.ipHash,
      userAgent: info.userAgent?.slice(0, 300) ?? null,
    },
  })
  return token
}

/** Generic outcome only: the caller shows the same message for unknown user / wrong password. */
export async function login(
  input: { username: string; password: string },
  info: RequestInfo,
): Promise<LoginResult> {
  await ensureReady()
  const username = input.username.trim().toLowerCase().slice(0, 100)
  const password = input.password.slice(0, 256)

  if (loginsPerIp.blocked(info.ipKey)) return { ok: false, reason: 'locked' }

  const user = await prisma.user.findUnique({ where: { username } })
  const now = Date.now()

  if (!user || !user.isActive) {
    await verifyPassword(await timingDummyHash(), password) // same cost as a real check
    loginsPerIp.hit(info.ipKey)
    await recordAudit({
      action: 'auth.login_failed',
      ipHash: info.ipHash,
      metadata: { reason: user ? 'inactive' : 'unknown_user' },
    })
    return { ok: false, reason: 'invalid' }
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > now) {
    await recordAudit({
      action: 'auth.login_blocked',
      targetType: 'User',
      targetId: user.id,
      ipHash: info.ipHash,
    })
    return { ok: false, reason: 'locked' }
  }

  if (!(await verifyPassword(user.passwordHash, password))) {
    loginsPerIp.hit(info.ipKey)
    const lock = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { failedLogins: { increment: 1 } },
        select: { failedLogins: true },
      })
      if (updated.failedLogins >= MAX_FAILED_LOGINS) {
        await tx.user.update({
          where: { id: user.id },
          data: { failedLogins: 0, lockedUntil: new Date(now + LOCK_MS) },
        })
        return true
      }
      return false
    })
    await recordAudit({
      action: lock ? 'auth.account_locked' : 'auth.login_failed',
      targetType: 'User',
      targetId: user.id,
      ipHash: info.ipHash,
    })
    return { ok: false, reason: lock ? 'locked' : 'invalid' }
  }

  // Success: fresh session (rotation), counters reset, stale sessions of this user removed.
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date(now) },
  })
  await prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date(now) } } })
  const token = await createSession(user.id, info)
  await recordAudit({
    actor: { id: user.id, name: user.username },
    action: 'auth.login',
    targetType: 'User',
    targetId: user.id,
    ipHash: info.ipHash,
  })
  return { ok: true, token, mustChangePassword: user.mustChangePassword }
}

export interface SessionActor extends Actor {
  mustChangePassword: boolean
  sessionId: string
}

async function loadActor(userId: string): Promise<Omit<SessionActor, 'sessionId'> | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isActive) return null
  const links = await prisma.userRole.findMany({ where: { userId } })
  const roles = await prisma.role.findMany({ where: { id: { in: links.map((l) => l.roleId) } } })
  const rolePerms = await prisma.rolePermission.findMany({
    where: { roleId: { in: roles.map((r) => r.id) } },
  })
  const perms = await prisma.permission.findMany({
    where: { id: { in: rolePerms.map((rp) => rp.permissionId) } },
  })
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    roleKeys: roles.map((r) => r.key),
    permissions: new Set(perms.map((p) => p.key)),
    mustChangePassword: user.mustChangePassword,
  }
}

/** The signed-in user for a cookie token, or null (expired sessions are deleted). */
export async function actorFromSessionToken(
  token: string | undefined,
): Promise<SessionActor | null> {
  if (!token || token.length > 100) return null
  await ensureReady()
  const id = hashSessionToken(token)
  const session = await prisma.session.findUnique({ where: { id } })
  if (!session) return null
  if (sessionState(session) !== 'valid') {
    await prisma.session.delete({ where: { id } }).catch(() => undefined)
    return null
  }
  const actor = await loadActor(session.userId)
  if (!actor) return null
  if (shouldTouch(session.lastSeenAt)) {
    await prisma.session.updateMany({ where: { id }, data: { lastSeenAt: new Date() } })
  }
  return { ...actor, sessionId: id }
}

export async function logout(actor: SessionActor, ipHash: string | null): Promise<void> {
  await prisma.session.delete({ where: { id: actor.sessionId } }).catch(() => undefined)
  await recordAudit({
    actor: { id: actor.id, name: actor.username },
    action: 'auth.logout',
    targetType: 'User',
    targetId: actor.id,
    ipHash,
  })
}

/** Own password. Ends every session of the user and returns a fresh one. */
export async function changeOwnPassword(
  actor: SessionActor,
  input: { current: string; next: string },
  info: RequestInfo,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  await ensureReady()
  const user = await prisma.user.findUnique({ where: { id: actor.id } })
  if (!user || !user.isActive) return { ok: false, error: 'Account not found.' }
  if (!(await verifyPassword(user.passwordHash, input.current.slice(0, 256)))) {
    await recordAudit({
      actor: { id: actor.id, name: actor.username },
      action: 'auth.password_change_failed',
      targetType: 'User',
      targetId: actor.id,
      ipHash: info.ipHash,
    })
    return { ok: false, error: 'The current password is incorrect.' }
  }
  if (input.next === input.current) return { ok: false, error: 'Choose a new password.' }
  const problem = passwordProblem(input.next, user.username)
  if (problem) return { ok: false, error: problem }

  const passwordHash = await hashPassword(input.next)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false },
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ])
  const token = await createSession(user.id, info)
  await recordAudit({
    actor: { id: actor.id, name: actor.username },
    action: 'auth.password_changed',
    targetType: 'User',
    targetId: actor.id,
    ipHash: info.ipHash,
  })
  return { ok: true, token }
}
