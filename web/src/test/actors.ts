import { SUPER_ADMIN_ROLE, SYSTEM_ROLES, type Actor } from '@/modules/authorization'

export function actorWith(
  permissions: readonly string[],
  roleKeys: string[] = [],
  id = 'u-test',
): Actor {
  return { id, username: id, name: id, permissions: new Set(permissions), roleKeys }
}

const role = (key: string) => SYSTEM_ROLES.find((r) => r.key === key)!

export const superAdmin = () =>
  actorWith(role(SUPER_ADMIN_ROLE).permissions, [SUPER_ADMIN_ROLE], 'u-super')
export const editor = () => actorWith(role('editor').permissions, ['editor'], 'u-editor')
export const nobody = () => actorWith([], [], 'u-nobody')
