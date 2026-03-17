import { inject, Injectable } from '@angular/core'
import { AdonisJSResponse } from '@kdongs-mono/domain/dto/shared/default-response-dto'
import { LoginRequest, LoginResponse } from '@kdongs-mono/domain/dto/user/user-dto'
import { catchError, map, Observable, throwError } from 'rxjs'
import { IdentityService } from '../../services/identity/identity.service'
import { GatewayError } from '../shared/default-gateway.model'
import { DefaultGatewayService } from '../shared/default-gateway.service'

@Injectable()
export class LoginGatewayService extends DefaultGatewayService {
  private readonly _identityService = inject(IdentityService)

  authenticate(request: LoginRequest): Observable<boolean> {
    return this.http
      .post<AdonisJSResponse<LoginResponse>>(`${this.apiUrl}/login`, request, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map(response => {
          const { data } = this.parseResponse<LoginResponse>(response.body)
          return this._identityService.processIdentity(data)
        }),
        catchError(_error => {
          return throwError(() => new GatewayError(500, '┬┴┬┴┤ʕ•ᴥ├┬┴┬┴', 'Something wrong..'))
        })
      )
  }
}
