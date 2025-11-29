import { ModulePermissions } from '../../services/identity/identity.model';
import { AdonisJSErrorSchema } from '../shared/default-gateway.model';
import { z } from 'zod';

export const AuthenticatedUserDTOSchema = z.object({
  userName: z.string(),
  userEmail: z.string(),
  allowedIn: z.array(z.enum(ModulePermissions)),
  tokenExp: z.number(),
});
export const AuthenticateRequestSchema = z.object({
  email: z.optional(z.string().email()),
  password: z.optional(z.string()),
});
export const AuthenticateResponseSchema = z.object({
  data: AuthenticatedUserDTOSchema,
  errors: z.optional(AdonisJSErrorSchema.def.shape.errors),
});

export type AuthenticatedUserDTO = z.infer<typeof AuthenticatedUserDTOSchema>;
export type AuthenticateRequest = z.infer<typeof AuthenticateRequestSchema>;
export type AuthenticateResponse = z.infer<typeof AuthenticateResponseSchema>;
