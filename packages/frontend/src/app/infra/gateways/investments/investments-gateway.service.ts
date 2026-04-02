import { Injectable } from '@angular/core'
import {
  ShowWalletMovementRequest,
  ShowWalletMovementResponse,
} from '@kdongs-mono/domain/dto/investment/wallet-movement/wallet-movement-dto'
import {
  AdonisJSPaginationResponse,
  AdonisJSResponse,
} from '@kdongs-mono/domain/dto/shared/default-response-dto'
import {
  LiquidationSeriesAnalyticsRequest,
  LiquidationSeriesAnalyticsResponse,
} from '@kdongs/domain/dto/investment/analytic/liquidation-series-dto'
import {
  PerformanceAnalayticsRequest,
  PerformanceAnalyticsResponse,
} from '@kdongs/domain/dto/investment/analytic/performance-dto'
import {
  CreateWalletMovementRequest,
  CreateWalletMovementResponse,
  EditWalletMovementRequest,
  EditWalletMovementResponse,
  IndexWalletMovementRequest,
  IndexWalletMovementResponse,
  StoreWalletMovementRequest,
  UpdateWalletMovementRequest,
} from '@kdongs/domain/dto/investment/wallet-movement/wallet-movement-dto'
import {
  CreateWalletResponse,
  EditWalletRequest,
  EditWalletResponse,
  IndexWalletRequest,
  IndexWalletResponse,
  StoreWalletRequest,
  UpdateWalletRequest,
} from '@kdongs/domain/dto/investment/wallet/wallet-dto'
import { catchError, map, Observable, throwError } from 'rxjs'
import { DefaultGatewayService } from '../shared/default-gateway.service'

@Injectable()
export class InvestmentsGatewayService extends DefaultGatewayService {
  /**
   * WALLETS
   *
   */
  indexWallet(
    request: IndexWalletRequest
  ): Observable<AdonisJSPaginationResponse<IndexWalletResponse>> {
    return this.http
      .get<AdonisJSPaginationResponse<IndexWalletResponse>>(`${this.apiUrl}/investments/wallets`, {
        observe: 'response',
        withCredentials: true,
        params: request,
      })
      .pipe(
        map(response => {
          return this.parseResponse<IndexWalletResponse>(
            response.body
          ) as AdonisJSPaginationResponse<IndexWalletResponse>
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  getPerformanceAnalytics(
    request: PerformanceAnalayticsRequest
  ): Observable<AdonisJSResponse<PerformanceAnalyticsResponse>> {
    return this.http
      .get<AdonisJSResponse<PerformanceAnalyticsResponse>>(
        `${this.apiUrl}/investments/performance`,
        {
          observe: 'response',
          withCredentials: true,
          params: request,
        }
      )
      .pipe(
        map(response => {
          return this.parseResponse<PerformanceAnalyticsResponse>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  getLiquidationSeriesAnalytics(
    request: LiquidationSeriesAnalyticsRequest
  ): Observable<AdonisJSResponse<LiquidationSeriesAnalyticsResponse>> {
    return this.http
      .get<AdonisJSResponse<LiquidationSeriesAnalyticsResponse>>(
        `${this.apiUrl}/investments/liquidation-series`,
        {
          observe: 'response',
          withCredentials: true,
          params: request,
        }
      )
      .pipe(
        map(response => {
          return this.parseResponse<LiquidationSeriesAnalyticsResponse>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  createWallet(): Observable<AdonisJSResponse<CreateWalletResponse>> {
    return this.http
      .get<AdonisJSResponse<CreateWalletResponse>>(`${this.apiUrl}/investments/wallets/create`, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map(response => {
          return this.parseResponse<CreateWalletResponse>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  editWallet(request: EditWalletRequest): Observable<AdonisJSResponse<EditWalletResponse>> {
    return this.http
      .get<AdonisJSResponse<EditWalletResponse>>(
        `${this.apiUrl}/investments/wallets/${request.walletId}/edit`,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map(response => {
          return this.parseResponse<EditWalletResponse>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  storeWallet(request: StoreWalletRequest): Observable<void> {
    return this.http
      .post<AdonisJSResponse<void>>(`${this.apiUrl}/investments/wallets`, request, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map(response => {
          this.parseResponse<void>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  updateWallet(request: UpdateWalletRequest): Observable<void> {
    return this.http
      .patch<AdonisJSResponse<void>>(`${this.apiUrl}/investments/wallets`, request, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map(response => {
          this.parseResponse<void>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  /**
   * WALLET MOVEMENTS
   *
   */
  indexWalletMovement(
    request: IndexWalletMovementRequest
  ): Observable<AdonisJSPaginationResponse<IndexWalletMovementResponse>> {
    return this.http
      .get<AdonisJSPaginationResponse<IndexWalletMovementResponse>>(
        `${this.apiUrl}/investments/wallets/${request.walletId}/movements`,
        {
          observe: 'response',
          withCredentials: true,
          params: request,
        }
      )
      .pipe(
        map(response => {
          return this.parseResponse<IndexWalletMovementResponse>(
            response.body
          ) as AdonisJSPaginationResponse<IndexWalletMovementResponse>
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  showWalletMovement(
    request: ShowWalletMovementRequest
  ): Observable<AdonisJSResponse<ShowWalletMovementResponse>> {
    return this.http
      .get<AdonisJSResponse<ShowWalletMovementResponse>>(
        `${this.apiUrl}/investments/wallets/${request.walletId}/movements/${request.movementId}`,
        {
          observe: 'response',
          withCredentials: true,
          params: request,
        }
      )
      .pipe(
        map(response => {
          return this.parseResponse<ShowWalletMovementResponse>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  createWalletMovement(
    request: CreateWalletMovementRequest
  ): Observable<AdonisJSResponse<CreateWalletMovementResponse>> {
    return this.http
      .get<AdonisJSResponse<CreateWalletMovementResponse>>(
        `${this.apiUrl}/investments/wallets/${request.walletId}/movements/create`,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map(response => {
          return this.parseResponse<CreateWalletMovementResponse>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  editWalletMovement(
    request: EditWalletMovementRequest
  ): Observable<AdonisJSResponse<EditWalletMovementResponse>> {
    return this.http
      .get<AdonisJSResponse<EditWalletMovementResponse>>(
        `${this.apiUrl}/investments/wallets/${request.walletId}/movements/${request.movementId}/edit`,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map(response => {
          return this.parseResponse<EditWalletMovementResponse>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  storeWalletMovement(request: StoreWalletMovementRequest): Observable<void> {
    return this.http
      .post<AdonisJSResponse<void>>(
        `${this.apiUrl}/investments/wallets/${request.walletId}/movements`,
        request,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map(response => {
          this.parseResponse<void>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }

  updateWalletMovement(request: UpdateWalletMovementRequest): Observable<void> {
    return this.http
      .patch<AdonisJSResponse<void>>(
        `${this.apiUrl}/investments/wallets/${request.walletId}/movements/${request.movementId}`,
        request,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
      .pipe(
        map(response => {
          this.parseResponse<void>(response.body)
        }),
        catchError(error => {
          return throwError(() => this.parseError(error))
        })
      )
  }
}
