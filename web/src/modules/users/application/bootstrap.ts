import { prisma } from '@/server/db'
import { hashPassword } from '@/server/auth/password'
import { recordAudit } from '@/modules/audit-logs'
import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  SUPER_ADMIN_ROLE,
  SYSTEM_ROLES,
} from '@/modules/authorization'

/* ------------------------------------------------------------------ RBAC sync + bootstrap */

/** Permissions and shipped roles from code -> database. Idempotent; runs once per process. */
export async function syncRbac(db = prisma): Promise<void> {
  for (const [key, description] of Object.entries(PERMISSIONS)) {
    await db.permission.upsert({
      where: { key },
      create: { key, description },
      update: { description },
    })
  }
  const permissions = await db.permission.findMany({ where: { key: { in: ALL_PERMISSIONS } } })
  const idByKey = new Map(permissions.map((p) => [p.key, p.id]))
  for (const role of SYSTEM_ROLES) {
    const row = await db.role.upsert({
      where: { key: role.key },
      create: { key: role.key, name: role.name, description: role.description, isSystem: true },
      update: { name: role.name, description: role.description, isSystem: true },
    })
    await db.$transaction([
      db.rolePermission.deleteMany({ where: { roleId: row.id } }),
      db.rolePermission.createMany({
        data: role.permissions.map((key) => ({ roleId: row.id, permissionId: idByKey.get(key)! })),
      }),
    ])
  }
}

/**
 * First Super Admin from ADMIN_USER / ADMIN_PASSWORD, only while there are no users at all.
 * The password must be changed at the first sign-in.
 */
export async function bootstrapAdmin(env = process.env, db = prisma): Promise<boolean> {
  const username = env.ADMIN_USER?.trim().toLowerCase()
  const password = env.ADMIN_PASSWORD ?? ''
  if (!username || password.length < 12) return false
  // Same rule as usernames made in /admin/users; no "@", so the shared sign-in page (D-41)
  // treats it as a team login and not as a visitor's email.
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    console.error(
      '[bootstrap] ADMIN_USER must be 3-40 letters, digits, dots, dashes or underscores',
    )
    return false
  }
  if ((await db.user.count()) > 0) return false
  const role = await db.role.findUniqueOrThrow({ where: { key: SUPER_ADMIN_ROLE } })
  const passwordHash = await hashPassword(password)
  try {
    return await db.$transaction(async (tx) => {
      if ((await tx.user.count()) > 0) return false
      const user = await tx.user.create({
        data: {
          username,
          name: 'Administrator',
          passwordHash,
          mustChangePassword: true,
        },
      })
      await tx.userRole.create({ data: { userId: user.id, roleId: role.id } })
      await recordAudit({ action: 'user.bootstrap', targetType: 'User', targetId: user.id }, tx)
      return true
    })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      return false
    }
    throw err
  }
}
