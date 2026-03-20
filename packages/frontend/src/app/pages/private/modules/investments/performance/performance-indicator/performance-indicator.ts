import { DatePipe } from '@angular/common'
import { Component, inject, OnDestroy, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { PerformanceAnalyticsResponse } from '@kdongs/domain/dto/investment/analytic/performance-dto'
import { CurrencyCode } from '@kdongs/domain/types/investment/currency-code'
import { combineLatest, debounceTime, Subscription, switchMap, tap } from 'rxjs'
import { MonetaryDirective } from '../../../../../../infra/directives/monetary.directive'
import { InvestmentsGatewayService } from '../../../../../../infra/gateways/investments/investments-gateway.service'
import { MonetaryPipe } from '../../../../../../infra/pipes/monetary.pipe'
import { PercentPipe } from '../../../../../../infra/pipes/percent.pipe'
import { Gauge } from '../../../../components/gauge/gauge'
import { LoadingBar } from '../../../../components/loading-bar/loading-bar'
import { PerformanceService } from '../performance.service'

@Component({
  selector: 'kdongs-performance-indicator',
  templateUrl: './performance-indicator.html',
  imports: [DatePipe, PercentPipe, MonetaryPipe, LoadingBar, Gauge, MonetaryDirective],
})
export class PerformanceIndicator implements OnDestroy {
  /**
   * SERVICES
   */
  protected readonly performanceService = inject(PerformanceService)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)

  /**
   * SIGNALS
   */
  protected loading = signal<boolean>(false)
  protected performance = signal<PerformanceAnalyticsResponse['indicators'] | null | undefined>(
    undefined
  )

  /**
   * VARS
   */
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    const selectedWalletIds$ = toObservable(this.performanceService.selectedWalletIds)
    const selectedCurrency$ = toObservable(this.performanceService.selectedCurrency)

    this._investmentsSubscription = combineLatest([selectedWalletIds$, selectedCurrency$])
      .pipe(
        debounceTime(150),
        tap(() => this.loading.set(true)),
        switchMap(([walletIds, selectedCurrency]) => {
          return this._investmentsGatewayService.getPerformanceAnalytics({
            useLivePriceQuote: false,
            walletIds,
            selectedCurrency,
          })
        })
      )
      .subscribe({
        next: response => {
          this.performanceService.handleSelectedWalletIdsChange(response.data.walletIds)
          this.performanceService.currencyToShow.set(response.data.currencyToShow as CurrencyCode)
          this.performance.set(response.data.indicators)
          this.loading.set(false)
        },
        error: () => {
          this.performance.set(null)
          this.loading.set(false)
        },
      })
  }

  ngOnDestroy(): void {
    this._investmentsSubscription?.unsubscribe()
  }
}
