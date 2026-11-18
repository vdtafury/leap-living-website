/**
 * Permission registry (code) and the shipped roles (data, synced on start). Business code
 * checks permissions, never role names (ARCHITECTURE.md §6). A new role is a new row; a new
 * permission is added here when its feature is built.
 */
export const PERMISSIONS = {
  'dashboard.view': 'See the dashboard overview',
  'property.view': 'See listings in the admin, including drafts',
  'property.edit': 'Create and edit listings',
  'property.publish': 'Publish, unpublish and archive listings',
  'property.delete': 'Delete listings',
  'project.view': 'See projects in the admin, including drafts',
  'project.edit': 'Create and edit projects',
  'project.publish': 'Publish, unpublish and archive projects',
  'project.delete': 'Delete projects',
  'media.view': 'See the media library',
  'media.upload': 'Upload images',
  'media.delete': 'Delete unused images',
  'inquiry.view': 'Read form submissions (personal data)',
  'inquiry.update': 'Change the follow-up status of form submissions',
  'inquiry.export': 'Download form submissions as CSV',
  'customer.view': 'See website accounts (personal data)',
  'customer.manage': 'Deactivate and reactivate website accounts',
  'review.view': 'Read client reviews sent from website accounts, including unpublished ones',
  'review.moderate': 'Approve, hide and delete client reviews',
  'email.view': 'See the email outbox',
  'email.retry': 'Send queued emails now / retry failed ones',
  'content.view': 'See page content and settings in the admin',
  'content.edit': 'Edit page content and settings drafts',
  'content.publish': 'Publish page content and settings',
  'developer.manage': 'Manage the developer logo strip',
  'user.view': 'See admin users',
  'user.manage': 'Create users, assign roles, deactivate, reset passwords',
  'audit.view': 'Read the audit log',
} as const

export type PermissionKey = keyof typeof PERMISSIONS
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as PermissionKey[]

export interface RoleDefinition {
  key: string
  name: string
  description: string
  permissions: readonly PermissionKey[]
}

export const SUPER_ADMIN_ROLE = 'super_admin'

/** Shipped roles. Super Admin always holds every permission, including future ones. */
export const SYSTEM_ROLES: readonly RoleDefinition[] = [
  {
    key: SUPER_ADMIN_ROLE,
    name: 'Super Admin',
    description: 'Full access, including users and roles.',
    permissions: ALL_PERMISSIONS,
  },
  {
    key: 'editor',
    name: 'Editor',
    description:
      'Manages listings, projects, images, developers and page content. No access to form submissions or users.',
    permissions: [
      'dashboard.view',
      'property.view',
      'property.edit',
      'property.publish',
      'project.view',
      'project.edit',
      'project.publish',
      'media.view',
      'media.upload',
      'content.view',
      'content.edit',
      'content.publish',
      'developer.manage',
    ],
  },
]

export interface Actor {
  id: string
  username: string
  name: string
  permissions: ReadonlySet<string>
  roleKeys: readonly string[]
}

export class ForbiddenError extends Error {
  constructor(public readonly permission: string) {
    super(`Missing permission: ${permission}`)
    this.name = 'ForbiddenError'
  }
}

export function can(actor: Actor | null | undefined, permission: PermissionKey): boolean {
  return Boolean(actor?.permissions.has(permission))
}

/** Throws unless the actor holds the permission. Call it next to the data access. */
export function authorize(actor: Actor | null | undefined, permission: PermissionKey): Actor {
  if (!actor || !actor.permissions.has(permission)) throw new ForbiddenError(permission)
  return actor
}

/**
 * Role assignment rule (SECURITY.md §2): nobody grants what they do not hold, and only a
 * Super Admin hands out or takes away the Super Admin role.
 */
export function canAssignRole(
  actor: Actor,
  role: { key: string; permissions: readonly string[] },
): boolean {
  if (!actor.permissions.has('user.manage')) return false
  if (role.key === SUPER_ADMIN_ROLE) return actor.roleKeys.includes(SUPER_ADMIN_ROLE)
  return role.permissions.every((p) => actor.permissions.has(p))
}
