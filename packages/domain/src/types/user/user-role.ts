export const UserRoles = {
  admin: 'admin',
  user: 'user',
  visitor: 'visitor',
} as const
export type UserRole = keyof typeof UserRoles
export const acceptedUserRoles: string[] = Object.values(UserRoles)
