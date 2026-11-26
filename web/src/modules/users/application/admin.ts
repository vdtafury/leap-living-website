import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { hashPassword, passwordProblem } from '@/server/auth/password'
import { recordAudit } from '@/modules/audit-logs'
import { authorize, canAssignRole, SUPER_ADMIN_ROLE, type Actor } from '@/modules/authorization'

/* ------------------------------------------------------------------ user administration */

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,40}$/, 'Use 3–40 letters, digits, dots, dashes or underscores.'),
  name: z.string().trim().min(2, 'Enter the full name.').max(80),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email.').max(120)]),
  roleKey: z.string().min(1),
  password: z.string(),
})

async function loadRoles() {
  await ensureReady()
  const [roles, links, perms] = await Promise.all([
    prisma.role.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.rolePermission.findMany(),
    prisma.permission.findMany(),
  ])
  const keyById = new Map(perms.map((p) => [p.id, p.key]))
  return roles.map((role) => ({
    ...role,
    permissions: links
      .filter((l) => l.roleId === role.id)
      .map((l) => keyById.get(l.permissionId))
      .filter((k): k is string => Boolean(k)),
  }))
}

export async function listRoles(actor: Actor) {
  authorize(actor, 'user.view')
  return loadRoles()
}

export async function listUsers(actor: Actor) {
  authorize(actor, 'user.view')
  await ensureReady()
  const [users, links, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      // never hand the password hash to a page
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        isActive: true,
        mustChangePassword: true,
        lockedUntil: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    prisma.userRole.findMany(),
    prisma.role.findMany(),
  ])
  const roleById = new Map(roles.map((r) => [r.id, r]))
  return users.map((user) => ({
    ...user,
    roles: links
      .filter((l) => l.userId === user.id)
      .map((l) => roleById.get(l.roleId))
      .filter((r): r is NonNullable<typeof r> => Boolean(r)),
  }))
}

type Result = { ok: true } | { ok: false; error: string }

export async function createUser(actor: Actor, raw: unknown): Promise<Result> {
  authorize(actor, 'user.manage')
  await ensureReady()
  const parsed = createUserSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const input = parsed.data
  const role = (await loadRoles()).find((r) => r.key === input.roleKey)
  if (!role) return { ok: false, error: 'Unknown role.' }
  if (!canAssignRole(actor, role)) return { ok: false, error: 'You cannot assign this role.' }
  const problem = passwordProblem(input.password, input.username)
  if (problem) return { ok: false, error: problem }
  if (await prisma.user.findUnique({ where: { username: input.username } })) {
    return { ok: false, error: 'This username is taken.' }
  }
  const passwordHash = await hashPassword(input.password)
  const id = randomUUID()
  // user, role link, and audit entry together: a user without a role would be a dead account
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id,
          username: input.username,
          name: input.name,
          email: input.email || null,
          passwordHash,
          mustChangePassword: true,
        },
      })
      await tx.userRole.create({ data: { userId: id, roleId: role.id } })
      await recordAudit(
        {
          actor,
          action: 'user.created',
          targetType: 'User',
          targetId: user.id,
          metadata: { username: user.username, role: role.key },
        },
        tx,
      )
    })
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    if (code === 'P2002') return { ok: false, error: 'This username is taken.' }
    throw error
  }
  return { ok: true }
}

async function guardTarget(actor: Actor, userId: string): Promise<Result> {
  if (userId === actor.id) return { ok: false, error: 'Use your own account page for yourself.' }
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!target) return { ok: false, error: 'User not found.' }
  if (actor.roleKeys.includes(SUPER_ADMIN_ROLE)) return { ok: true }
  const links = await prisma.userRole.findMany({ where: { userId } })
  const roles = await prisma.role.findMany({ where: { id: { in: links.map((l) => l.roleId) } } })
  if (roles.some((r) => r.key === SUPER_ADMIN_ROLE)) {
    return { ok: false, error: 'Only a Super Admin can change a Super Admin.' }
  }
  const rolePerms = await prisma.rolePermission.findMany({
    where: { roleId: { in: roles.map((r) => r.id) } },
  })
  const perms = await prisma.permission.findMany({
    where: { id: { in: rolePerms.map((rp) => rp.permissionId) } },
    select: { key: true },
  })
  if (perms.some((p) => !actor.permissions.has(p.key))) {
    return { ok: false, error: 'You cannot manage a user with permissions you do not hold.' }
  }
  return { ok: true }
}

export async function setUserActive(
  actor: Actor,
  userId: string,
  active: boolean,
): Promise<Result> {
  authorize(actor, 'user.manage')
  await ensureReady()
  const guard = await guardTarget(actor, userId)
  if (!guard.ok) return guard
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { isActive: active } })
    if (!active) await tx.session.deleteMany({ where: { userId } })
    await recordAudit(
      {
        actor,
        action: active ? 'user.activated' : 'user.deactivated',
        targetType: 'User',
        targetId: userId,
      },
      tx,
    )
  })
  return { ok: true }
}

export async function resetUserPassword(
  actor: Actor,
  userId: string,
  temporaryPassword: string,
): Promise<Result> {
  authorize(actor, 'user.manage')
  await ensureReady()
  const guard = await guardTarget(actor, userId)
  if (!guard.ok) return guard
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { ok: false, error: 'User not found.' }
  const problem = passwordProblem(temporaryPassword, user.username)
  if (problem) return { ok: false, error: problem }
  const passwordHash = await hashPassword(temporaryPassword)
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: true,
        failedLogins: 0,
        lockedUntil: null,
      },
    })
    await tx.session.deleteMany({ where: { userId } })
    await recordAudit(
      { actor, action: 'user.password_reset', targetType: 'User', targetId: userId },
      tx,
    )
  })
  return { ok: true }
}

export async function setUserRole(actor: Actor, userId: string, roleKey: string): Promise<Result> {
  authorize(actor, 'user.manage')
  await ensureReady()
  const guard = await guardTarget(actor, userId)
  if (!guard.ok) return guard
  const role = (await loadRoles()).find((r) => r.key === roleKey)
  if (!role) return { ok: false, error: 'Unknown role.' }
  if (!canAssignRole(actor, role)) return { ok: false, error: 'You cannot assign this role.' }
  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } })
    await tx.userRole.create({ data: { userId, roleId: role.id } })
    await recordAudit(
      {
        actor,
        action: 'user.role_changed',
        targetType: 'User',
        targetId: userId,
        metadata: { role: role.key },
      },
      tx,
    )
  })
  return { ok: true }
}
