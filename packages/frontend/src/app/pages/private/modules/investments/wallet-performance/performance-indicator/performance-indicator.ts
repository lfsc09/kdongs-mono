import { DatePipe } from '@angular/common'
import { Component, inject, OnDestroy, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { combineLatest, debounceTime, Subscription, switchMap } from 'rxjs'
import { PerformanceAnalyticsIndicatorsDTO } from '../../../../../../infra/gateways/investments/investments-gateway.model'
import { InvestmentsGatewayService } from '../../../../../../infra/gateways/investments/investments-gateway.service'
import { MonetaryPipe } from '../../../../../../infra/pipes/monetary.pipe'
import { PercentPipe } from '../../../../../../infra/pipes/percent.pipe'
import { Gauge } from '../../../../components/gauge/gauge'
import { LoadingBar } from '../../../../components/loading-bar/loading-bar'
import { Currency } from '../../investments.model'
import { InvestmentsService } from '../../investments.service'

@Component({
  selector: 'kdongs-performance-indicator',
  templateUrl: './performance-indicator.html',
  imports: [DatePipe, PercentPipe, MonetaryPipe, LoadingBar, Gauge],
})
export class PerformanceIndicator implements OnDestroy {
  /**
   * SERVICES
   */
  protected readonly investmentsService = inject(InvestmentsService)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)

  /**
   * SIGNALS
   */
  protected loading = signal<boolean>(false)
  protected performance = signal<PerformanceAnalyticsIndicatorsDTO | null | undefined>(undefined)

  /**
   * VARS
   */
  private _investmentsSubscription: Subscription | undefined

  // FIXME: Still doing 2 requests when walletIds is undefined (debounced is not blocking the second request)
  constructor() {
    const selectedWalletIds$ = toObservable(this.investmentsService.selectedWalletIds)
    const selectedCurrency$ = toObservable(this.investmentsService.selectedCurrency)

    this._investmentsSubscription = combineLatest([selectedWalletIds$, selectedCurrency$])
      .pipe(
        debounceTime(150),
        switchMap(([walletIds, selectedCurrency]) => {
          this.loading.set(true)
          return this._investmentsGatewayService.getPerformanceAnalytics({
            useLivePriceQuote: false,
            walletIds,
            selectedCurrency,
          })
        })
      )
      .subscribe({
        next: response => {
          this.investmentsService.handleSelectedWalletIdsChange(response.data.walletIds)
          this.investmentsService.currencyToShow.set(response.data.currencyToShow as Currency)
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
