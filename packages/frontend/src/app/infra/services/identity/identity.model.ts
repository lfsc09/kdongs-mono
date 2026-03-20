import { UserAbility } from '@kdongs-mono/domain/types/auth/abilities'

export interface UserIdentity {
  userName: string
  userEmail: string
  allowedIn: UserAllowedIn
  tokenExp: number
}

export type UserAllowedIn = Map<UserAbility, null>
