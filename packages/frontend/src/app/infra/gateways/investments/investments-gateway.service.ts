import { Injectable } from '@angular/core'
import { catchError, map, Observable, throwError } from 'rxjs'
import { GatewayError } from '../shared/default-gateway.model'
import { DefaultGatewayService } from '../shared/default-gateway.service'
import {
  CreateWalletMovementRequest,
  CreateWalletMovementRequestSchema,
  CreateWalletMovementResponse,
  CreateWalletMovementResponseSchema,
  CreateWalletResponse,
  CreateWalletResponseSchema,
  EditWalletMovementRequest,
  EditWalletMovementRequestSchema,
  EditWalletMovementResponse,
  EditWalletMovementResponseSchema,
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
  ListUserWalletMovementsRequestDTO,
  ListUserWalletMovementsRequestDTOSchema,
  ListUserWalletMovementsResponseDTO,
  ListUserWalletMovementsResponseDTOSchema,
  ListUserWalletRequestDTO,
  ListUserWalletRequestDTOSchema,
  ListUserWalletResponseDTO,
  ListUserWalletResponseDTOSchema,
  StoreWalletMovementRequest,
  StoreWalletMovementRequestSchema,
  StoreWalletMovementResponse,
  StoreWalletMovementResponseSchema,
  StoreWalletRequest,
  StoreWalletRequestSchema,
  StoreWalletResponse,
  StoreWalletResponseSchema,
  UpdateWalletMovementRequest,
  UpdateWalletMovementRequestSchema,
  UpdateWalletMovementResponse,
  UpdateWalletMovementResponseSchema,
  UpdateWalletRequest,
  UpdateWalletRequestSchema,
  UpdateWalletResponse,
  UpdateWalletResponseSchema,
} from './investments-gateway.model'

@Injectable()
export class InvestmentsGatewayService extends DefaultGatewayService {
  /**
   * WALLETS
   *
   */
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

  /**
   * WALLET MOVEMENTS
   *
   */
  listUserWalletMovements(
    request: ListUserWalletMovementsRequestDTO
  ): Observable<ListUserWalletMovementsResponseDTO> {
    const parsedRequest = ListUserWalletMovementsRequestDTOSchema.parse(request)
    return this.http
      .get<ListUserWalletMovementsResponseDTO>(
        `${this.apiUrl}/investments/wallets/${parsedRequest.walletId}/movements`,
        {
          observe: 'response',
          withCredentials: true,
          params: parsedRequest,
        }
      )
      .pipe(
        map(response => {
          const validationResult = ListUserWalletMovementsResponseDTOSchema.safeParse(response.body)

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map(e => e.message).join(', '),
              'Invalid list user wallet movements response structure'
            )
          }

          return validationResult.data
        }),
        catchError(error => {
          return throwError(() => this.handleHttpError(error))
        })
      )
  }

  createWalletMovement(
    request: CreateWalletMovementRequest
  ): Observable<CreateWalletMovementResponse> {
    const parsedRequest = CreateWalletMovementRequestSchema.parse(request)
    return this.http
      .get<CreateWalletMovementResponse>(
        `${this.apiUrl}/investments/wallets/${parsedRequest.walletId}/movements/create`,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map(response => {
          const validationResult = CreateWalletMovementResponseSchema.safeParse(response.body)

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

  editWalletMovement(request: EditWalletMovementRequest): Observable<EditWalletMovementResponse> {
    const parsedRequest = EditWalletMovementRequestSchema.parse(request)
    return this.http
      .get<EditWalletMovementResponse>(
        `${this.apiUrl}/investments/wallets/${parsedRequest.walletId}/movements/${parsedRequest.movementId}/edit`,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map(response => {
          const validationResult = EditWalletMovementResponseSchema.safeParse(response.body)

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

  storeWalletMovement(
    request: StoreWalletMovementRequest
  ): Observable<StoreWalletMovementResponse> {
    const parsedRequest = StoreWalletMovementRequestSchema.parse(request)
    return this.http
      .post<StoreWalletMovementResponse>(
        `${this.apiUrl}/investments/wallets/${parsedRequest.walletId}/movements`,
        parsedRequest,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map(response => {
          const validationResult = StoreWalletMovementResponseSchema.safeParse(response.body)

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map(e => e.message).join(', '),
              'Invalid store wallet movement response structure'
            )
          }

          const { errors } = validationResult.data

          if (errors && errors.length > 0) {
            throw new GatewayError(
              response.status,
              errors.map(e => e.message).join(', '),
              'Store wallet movement failed with errors'
            )
          }

          return validationResult.data
        }),
        catchError(error => {
          return throwError(() => this.handleHttpError(error))
        })
      )
  }

  updateWalletMovement(
    request: UpdateWalletMovementRequest
  ): Observable<UpdateWalletMovementResponse> {
    const parsedRequest = UpdateWalletMovementRequestSchema.parse(request)
    return this.http
      .patch<UpdateWalletMovementResponse>(
        `${this.apiUrl}/investments/wallets/${parsedRequest.walletId}/movements/${parsedRequest.movementId}`,
        parsedRequest,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map(response => {
          const validationResult = UpdateWalletMovementResponseSchema.safeParse(response.body)

          if (!validationResult.success) {
            throw new GatewayError(
              response.status,
              validationResult.error.issues.map(e => e.message).join(', '),
              'Invalid update wallet movement response structure'
            )
          }

          const { errors } = validationResult.data

          if (errors && errors.length > 0) {
            throw new GatewayError(
              response.status,
              errors.map(e => e.message).join(', '),
              'Update wallet movement failed with errors'
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
