import { FrontendRole } from '@kdongs-mono/domain/types/auth/frontend-role'

export interface UserIdentity {
  userName: string
  userEmail: string
  allowedIn: UserAllowedIn
  tokenExp: number
}

export type UserAllowedIn = Map<FrontendRole, null>
