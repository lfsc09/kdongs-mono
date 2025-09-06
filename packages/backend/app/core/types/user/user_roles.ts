const userRolesLiteral = ['user', 'admin'] as const;
export type UserRole = (typeof userRolesLiteral)[number];
export const acceptedUserRoles: string[] = [...userRolesLiteral];

const frontendRolesLiteral = ['INVESTMENTS_ACCESS'] as const;
export type FrontendRole = (typeof frontendRolesLiteral)[number];
export const frontendPermissionsbyUserRole: Record<UserRole, FrontendRole[]> = {
  user: ['INVESTMENTS_ACCESS'],
  admin: ['INVESTMENTS_ACCESS'],
};
