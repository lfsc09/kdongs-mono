import { UserRole, UserRoles } from '../user/user-role.js'

export const FrontendRoles = {
  INVESTMENTS_ACCESS: 'INVESTMENTS_ACCESS',
} as const
export type FrontendRole = keyof typeof FrontendRoles
export const frontendPermissionsbyUserRole: Record<UserRole, FrontendRole[]> = {
  [UserRoles.admin]: [FrontendRoles.INVESTMENTS_ACCESS],
  [UserRoles.user]: [FrontendRoles.INVESTMENTS_ACCESS],
}
