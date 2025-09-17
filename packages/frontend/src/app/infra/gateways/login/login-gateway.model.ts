import { Observable } from 'rxjs';
import { AdonisJSError } from '../shared/default-gateway.model';
import { ModulePermissions } from '../../services/identity/identity.model';

export interface LoginGateway {
  authenticate(request: AuthenticateRequest): Observable<boolean>;
}

export type AuthenticateRequest = {
  email: string | null | undefined;
  password: string | null | undefined;
};
export type AuthenticateResponse = {
  data: AuthenticatedUser;
  errors?: AdonisJSError;
} | null;

export type AuthenticatedUser = {
  userName: string;
  userEmail: string;
  allowedIn: ModulePermissions[];
  tokenExp: number;
};
