import { inject, Injectable } from '@angular/core'
import { AdonisJSResponse } from '@kdongs-mono/domain/dto/shared/default-response-dto'
import { catchError, map, Observable, throwError } from 'rxjs'
import { IdentityService } from '../../services/identity/identity.service'
import { DefaultGatewayService } from '../shared/default-gateway.service'

@Injectable()
export class LogoutGatewayService extends DefaultGatewayService {
  private readonly _identityService = inject(IdentityService)

  execute(): Observable<void> {
    return this.http
      .delete<AdonisJSResponse<void>>(`${this.apiUrl}/logout`, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map(_response => {
          this._identityService.clearAll()
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }
}
