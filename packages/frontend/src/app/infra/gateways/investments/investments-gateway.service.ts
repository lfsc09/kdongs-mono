import { Injectable } from '@angular/core'
import { catchError, map, Observable, throwError } from 'rxjs'
import { GatewayError } from '../shared/default-gateway.model'
import { DefaultGatewayService } from '../shared/default-gateway.service'
import {
  GetPerformanceAnalyticsRequestDTO,
  GetPerformanceAnalyticsRequestDTOSchema,
  GetPerformanceAnalyticsResponseDTO,
  GetPerformanceAnalyticsResponseDTOSchema,
  ListUserWalletRequestDTO,
  ListUserWalletRequestDTOSchema,
  ListUserWalletResponseDTO,
  ListUserWalletResponseDTOSchema,
} from './investments-gateway.model'

@Injectable()
export class InvestmentsGatewayService extends DefaultGatewayService {
  listUserWallets(request: ListUserWalletRequestDTO): Observable<ListUserWalletResponseDTO> {
    const parsedRequest = ListUserWalletRequestDTOSchema.parse(request)
    return this.http
      .get<ListUserWalletResponseDTO>(`${this.apiUrl}/investments/wallets`, {
        observe: 'response',
        withCredentials: true,
        params: parsedRequest,
      })
      .pipe(
        map(response => {
          const validationResult = ListUserWalletResponseDTOSchema.safeParse(response.body)

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map(e => e.message).join(', '),
              'Invalid list user wallets response structure'
            )
          }

          return validationResult.data
        }),
        catchError(error => {
          return throwError(() => this.handleHttpError(error))
        })
      )
  }

  getPerformanceAnalytics(
    request: GetPerformanceAnalyticsRequestDTO
  ): Observable<GetPerformanceAnalyticsResponseDTO> {
    const parsedRequest = GetPerformanceAnalyticsRequestDTOSchema.parse(request)
    return this.http
      .get<GetPerformanceAnalyticsResponseDTO>(`${this.apiUrl}/investments/performance`, {
        observe: 'response',
        withCredentials: true,
        params: parsedRequest,
      })
      .pipe(
        map(response => {
          const validationResult = GetPerformanceAnalyticsResponseDTOSchema.safeParse(response.body)

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map(e => e.message).join(', '),
              'Invalid performance response structure'
            )
          }

          return validationResult.data
        }),
        catchError(error => {
          return throwError(() => this.handleHttpError(error))
        })
      )
  }
}
