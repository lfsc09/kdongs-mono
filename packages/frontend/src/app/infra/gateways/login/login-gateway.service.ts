import { inject, Injectable } from '@angular/core';
import { DefaultGatewayService } from '../shared/default-gateway.service';
import { IdentityService } from '../../services/identity/identity.service';
import { Observable, map, catchError, throwError } from 'rxjs';
import {
  AuthenticateRequest,
  AuthenticateResponse,
  AuthenticateResponseSchema,
} from './login-gateway.model';
import { GatewayError } from '../shared/default-gateway.model';

@Injectable()
export class LoginGatewayService extends DefaultGatewayService {
  private readonly _identityService = inject(IdentityService);

  authenticate(request: AuthenticateRequest): Observable<boolean> {
    return this.http
      .post<AuthenticateResponse>(`${this.apiUrl}/login`, request, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          const validationResult = AuthenticateResponseSchema.safeParse(response.body);

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map((e) => e.message).join(', '),
              'Invalid authentication response structure',
            );
          }

          const { data, errors } = validationResult.data;

          if (errors && errors.length > 0) {
            throw new GatewayError(
              response.status,
              errors.map((e) => e.message).join(', '),
              'Authentication failed with errors',
            );
          }

          return this._identityService.processIdentity(data);
        }),
        catchError((error) => {
          return throwError(() => this.handleHttpError(error));
        }),
      );
  }
}
