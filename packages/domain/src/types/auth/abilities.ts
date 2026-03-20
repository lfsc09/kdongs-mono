import { UserRole, UserRoles } from '../user/user-role.js'

export const UserAbilities = {
  'asset.mutate': 'asset.mutate',
  'investment.access': 'investment.access',
  'wallet.mutate': 'wallet.mutate',
} as const
export type UserAbility = keyof typeof UserAbilities
export const userRoleAbilities: Record<UserRole, UserAbility[]> = {
  [UserRoles.admin]: [...Object.values(UserAbilities)],
  [UserRoles.user]: [
    UserAbilities['investment.access'],
    UserAbilities['wallet.mutate'],
    UserAbilities['asset.mutate'],
  ],
  [UserRoles.visitor]: [UserAbilities['investment.access']],
}
