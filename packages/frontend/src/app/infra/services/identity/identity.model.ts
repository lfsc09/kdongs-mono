export interface UserIdentity {
  userName: string
  userEmail: string
  allowedIn: UserAllowedIn
  tokenExp: number
}

export type UserAllowedIn = Map<ModulePermissions, null>

export enum ModulePermissions {
  INVESTMENTS_ACCESS = 'INVESTMENTS_ACCESS',
}
