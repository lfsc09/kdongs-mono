export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

const frontendRolesLiteral = ['INVESTMENTS_ACCESS'] as const;
export type FrontendRole = (typeof frontendRolesLiteral)[number];
export const frontendPermissionsbyUserRole: Record<UserRole, FrontendRole[]> = {
  user: ['INVESTMENTS_ACCESS'],
  admin: ['INVESTMENTS_ACCESS'],
};
