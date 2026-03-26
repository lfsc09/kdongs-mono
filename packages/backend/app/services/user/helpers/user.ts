import { userRoleAbilities } from '@kdongs-mono/domain/types/auth/abilities'
import { UserRole, UserRoles } from '@kdongs-mono/domain/types/user/user-role'

export const userTokenAbilities = (role: UserRole): string[] =>
  role === UserRoles.admin ? ['*'] : userRoleAbilities[role]
