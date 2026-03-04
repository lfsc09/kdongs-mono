import { Injectable } from '@angular/core'
import { catchError, map, Observable, throwError } from 'rxjs'
import { GatewayError } from '../shared/default-gateway.model'
import { DefaultGatewayService } from '../shared/default-gateway.service'
import {
  CreateWalletResponse,
  CreateWalletResponseSchema,
  EditWalletRequest,
  EditWalletRequestSchema,
  EditWalletResponse,
  EditWalletResponseSchema,
  GetLiquidationSeriesAnalyticsRequestDTO,
  GetLiquidationSeriesAnalyticsRequestDTOSchema,
  GetLiquidationSeriesAnalyticsResponseDTO,
  GetLiquidationSeriesAnalyticsResponseDTOSchema,
  GetPerformanceAnalyticsRequestDTO,
  GetPerformanceAnalyticsRequestDTOSchema,
  GetPerformanceAnalyticsResponseDTO,
  GetPerformanceAnalyticsResponseDTOSchema,
  ListUserWalletRequestDTO,
  ListUserWalletRequestDTOSchema,
  ListUserWalletResponseDTO,
  ListUserWalletResponseDTOSchema,
  StoreWalletRequest,
  StoreWalletRequestSchema,
  StoreWalletResponse,
  StoreWalletResponseSchema,
  UpdateWalletRequest,
  UpdateWalletRequestSchema,
  UpdateWalletResponse,
  UpdateWalletResponseSchema,
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

  getLiquidationSeriesAnalytics(
    request: GetLiquidationSeriesAnalyticsRequestDTO
  ): Observable<GetLiquidationSeriesAnalyticsResponseDTO> {
    const parsedRequest = GetLiquidationSeriesAnalyticsRequestDTOSchema.parse(request)
    return this.http
      .get<GetLiquidationSeriesAnalyticsResponseDTO>(
        `${this.apiUrl}/investments/liquidation-series`,
        {
          observe: 'response',
          withCredentials: true,
          params: parsedRequest,
        }
      )
      .pipe(
        map(response => {
          const validationResult = GetLiquidationSeriesAnalyticsResponseDTOSchema.safeParse(
            response.body
          )

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map(e => e.message).join(', '),
              'Invalid liquidation series response structure'
            )
          }

          return validationResult.data
        }),
        catchError(error => {
          return throwError(() => this.handleHttpError(error))
        })
      )
  }

  createWallet(): Observable<CreateWalletResponse> {
    return this.http
      .get<CreateWalletResponse>(`${this.apiUrl}/investments/wallets/create`, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map(response => {
          const validationResult = CreateWalletResponseSchema.safeParse(response.body)

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map(e => e.message).join(', '),
              'Invalid create wallet response structure'
            )
          }

          return validationResult.data
        }),
        catchError(error => {
          return throwError(() => this.handleHttpError(error))
        })
      )
  }

  editWallet(request: EditWalletRequest): Observable<EditWalletResponse> {
    const parsedRequest = EditWalletRequestSchema.parse(request)
    return this.http
      .get<EditWalletResponse>(
        `${this.apiUrl}/investments/wallets/${parsedRequest.walletId}/edit`,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map(response => {
          const validationResult = EditWalletResponseSchema.safeParse(response.body)

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map(e => e.message).join(', '),
              'Invalid edit wallet response structure'
            )
          }

          return validationResult.data
        }),
        catchError(error => {
          return throwError(() => this.handleHttpError(error))
        })
      )
  }

  storeWallet(request: StoreWalletRequest): Observable<StoreWalletResponse> {
    const parsedRequest = StoreWalletRequestSchema.parse(request)
    return this.http
      .post<StoreWalletResponse>(`${this.apiUrl}/investments/wallets`, parsedRequest, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map(response => {
          const validationResult = StoreWalletResponseSchema.safeParse(response.body)

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map(e => e.message).join(', '),
              'Invalid store wallet response structure'
            )
          }

          const { errors } = validationResult.data

          if (errors && errors.length > 0) {
            throw new GatewayError(
              response.status,
              errors.map(e => e.message).join(', '),
              'Store wallet failed with errors'
            )
          }

          return validationResult.data
        }),
        catchError(error => {
          return throwError(() => this.handleHttpError(error))
        })
      )
  }

  updateWallet(request: UpdateWalletRequest): Observable<UpdateWalletResponse> {
    const parsedRequest = UpdateWalletRequestSchema.parse(request)
    return this.http
      .patch<UpdateWalletResponse>(`${this.apiUrl}/investments/wallets`, parsedRequest, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map(response => {
          const validationResult = UpdateWalletResponseSchema.safeParse(response.body)

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map(e => e.message).join(', '),
              'Invalid update wallet response structure'
            )
          }

          const { errors } = validationResult.data

          if (errors && errors.length > 0) {
            throw new GatewayError(
              response.status,
              errors.map(e => e.message).join(', '),
              'Update wallet failed with errors'
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
