export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum FrontendRoles {
  INVESTMENTS_ACCESS = 'INVESTMENTS_ACCESS',
}
export type FrontendRole = keyof typeof FrontendRoles

export const frontendPermissionsbyUserRole: Record<UserRole, FrontendRole[]> = {
  admin: [FrontendRoles.INVESTMENTS_ACCESS],
  user: [FrontendRoles.INVESTMENTS_ACCESS],
}
