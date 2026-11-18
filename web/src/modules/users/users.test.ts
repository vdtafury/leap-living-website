import { beforeAll, describe, expect, it } from 'vitest'

await vi.hoisted(async () => {
  const { useTestEnvironment } = await import('@/test/env')
  useTestEnvironment()
})

import { vi } from 'vitest'
import { prisma } from '@/server/db'
import { ensureReady } from '@/server/bootstrap'
import { hashSessionToken } from '@/server/auth/session-token'
import { ForbiddenError } from '@/modules/authorization'
import {
  actorFromSessionToken,
  changeOwnPassword,
  createUser,
  login,
  MAX_FAILED_LOGINS,
  resetUserPassword,
  setUserActive,
  setUserRole,
} from '@/modules/users'
import { editor, superAdmin } from '@/test/actors'

const info = (ip = '10.0.0.1') => ({ ipKey: ip, ipHash: 'h', userAgent: 'vitest' })

beforeAll(async () => {
  await ensureReady()
})

describe('bootstrap', () => {
  it('creates the first Super Admin from ADMIN_USER / ADMIN_PASSWORD, forced to change it', async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { username: 'founder' } })
    expect(user.mustChangePassword).toBe(true)
    expect(user.passwordHash).toMatch(/^\$argon2id\$/)
    const roles = await prisma.userRole.findMany({ where: { userId: user.id } })
    const role = await prisma.role.findUniqueOrThrow({ where: { id: roles[0].roleId } })
    expect(role.key).toBe('super_admin')
  })

  it('syncs every permission and both shipped roles', async () => {
    expect(await prisma.role.count({ where: { isSystem: true } })).toBe(2)
    expect(await prisma.permission.count()).toBeGreaterThan(20)
  })
})

describe('sign-in', () => {
  it('rejects a wrong password and an unknown user with the same answer', async () => {
    expect(await login({ username: 'founder', password: 'wrong-password-123' }, info())).toEqual({
      ok: false,
      reason: 'invalid',
    })
    expect(await login({ username: 'ghost', password: 'whatever-123456' }, info())).toEqual({
      ok: false,
      reason: 'invalid',
    })
  })

  it('signs in, flags the password change, and the token maps to the user', async () => {
    const result = await login(
      { username: 'Founder ', password: 'initial-admin-password-1' },
      info(),
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.mustChangePassword).toBe(true)
    const actor = await actorFromSessionToken(result.token)
    expect(actor?.username).toBe('founder')
    expect(actor?.permissions.has('user.manage')).toBe(true)
    // Only the hash is stored.
    expect(await prisma.session.findUnique({ where: { id: result.token } })).toBeNull()
    expect(
      await prisma.session.findUnique({ where: { id: hashSessionToken(result.token) } }),
    ).not.toBeNull()
  })

  it('expires idle sessions', async () => {
    const result = await login(
      { username: 'founder', password: 'initial-admin-password-1' },
      info(),
    )
    if (!result.ok) throw new Error('login failed')
    await prisma.session.update({
      where: { id: hashSessionToken(result.token) },
      data: { lastSeenAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    })
    expect(await actorFromSessionToken(result.token)).toBeNull()
    expect(await actorFromSessionToken('not-a-token')).toBeNull()
  })

  it('locks the account after repeated failures, even for the right password', async () => {
    await createUser(superAdmin(), {
      username: 'locktest',
      name: 'Lock Test',
      email: '',
      roleKey: 'editor',
      password: 'a-good-password-42',
    })
    for (let i = 0; i < MAX_FAILED_LOGINS; i++) {
      await login({ username: 'locktest', password: 'nope-nope-nope' }, info(`10.1.0.${i}`))
    }
    const blocked = await login(
      { username: 'locktest', password: 'a-good-password-42' },
      info('10.2.0.1'),
    )
    expect(blocked).toEqual({ ok: false, reason: 'locked' })
    expect(await prisma.auditLog.count({ where: { action: 'auth.account_locked' } })).toBe(1)
  })

  it('password change ends every other session and issues a new one', async () => {
    const first = await login({ username: 'founder', password: 'initial-admin-password-1' }, info())
    if (!first.ok) throw new Error('login failed')
    const actor = (await actorFromSessionToken(first.token))!
    const weak = await changeOwnPassword(
      actor,
      { current: 'initial-admin-password-1', next: 'short' },
      info(),
    )
    expect(weak.ok).toBe(false)
    const changed = await changeOwnPassword(
      actor,
      { current: 'initial-admin-password-1', next: 'a-much-better-secret-9' },
      info(),
    )
    expect(changed.ok).toBe(true)
    if (!changed.ok) return
    expect(await actorFromSessionToken(first.token)).toBeNull()
    const fresh = await actorFromSessionToken(changed.token)
    expect(fresh?.mustChangePassword).toBe(false)
  })
})

describe('user administration (permission checks on the server)', () => {
  it('an Editor cannot list or create users', async () => {
    await expect(
      createUser(editor(), {
        username: 'x1',
        name: 'X',
        email: '',
        roleKey: 'editor',
        password: 'abcdefghijkl1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('nobody but a Super Admin hands out or changes the Super Admin role', async () => {
    // A user manager who is not a Super Admin
    const manager = { ...editor(), permissions: new Set([...editor().permissions, 'user.manage']) }
    const denied = await createUser(manager, {
      username: 'sneaky',
      name: 'Sneaky',
      email: '',
      roleKey: 'super_admin',
      password: 'a-good-password-43',
    })
    expect(denied).toEqual({ ok: false, error: 'You cannot assign this role.' })
    const founder = await prisma.user.findUniqueOrThrow({ where: { username: 'founder' } })
    expect(await setUserActive(manager, founder.id, false)).toMatchObject({ ok: false })
    expect(await resetUserPassword(manager, founder.id, 'another-pass-123')).toMatchObject({
      ok: false,
    })
    expect(await setUserRole(manager, founder.id, 'editor')).toMatchObject({ ok: false })
  })

  it('deactivating a user ends their sessions', async () => {
    await createUser(superAdmin(), {
      username: 'temp',
      name: 'Temp User',
      email: 'temp@example.com',
      roleKey: 'editor',
      password: 'short-lived-pass-777',
    })
    const signedIn = await login({ username: 'temp', password: 'short-lived-pass-777' }, info())
    if (!signedIn.ok) throw new Error('login failed')
    const user = await prisma.user.findUniqueOrThrow({ where: { username: 'temp' } })
    expect((await setUserActive(superAdmin(), user.id, false)).ok).toBe(true)
    expect(await actorFromSessionToken(signedIn.token)).toBeNull()
    expect(
      await login({ username: 'temp', password: 'short-lived-pass-777' }, info()),
    ).toMatchObject({ ok: false })
  })
})
