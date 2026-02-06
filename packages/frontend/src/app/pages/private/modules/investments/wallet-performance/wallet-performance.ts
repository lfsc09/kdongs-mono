import { Component, inject, OnDestroy, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { combineLatest, debounceTime, Subscription, switchMap } from 'rxjs'
import {
  GetUserWalletsPerformanceIndicatorsDTO,
  GetUserWalletsPerformanceSerieDTO,
} from '../../../../../infra/gateways/investments/investments-gateway.model'
import { InvestmentsGatewayService } from '../../../../../infra/gateways/investments/investments-gateway.service'
import { Currency } from '../investments.model'
import { InvestmentsService } from '../investments.service'
import { PerformanceEvolution } from './performance-evolution/performance-evolution'
import { PerformanceGroup } from './performance-group/performance-group'
import { PerformanceIndicator } from './performance-indicator/performance-indicator'

@Component({
  selector: 'kdongs-wallet-performance',
  templateUrl: './wallet-performance.html',
  imports: [PerformanceIndicator, PerformanceEvolution, PerformanceGroup],
})
export class WalletPerformance implements OnDestroy {
  /**
   * SERVICES
   */
  protected readonly investmentsService = inject(InvestmentsService)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)

  /**
   * SIGNALS
   */
  protected loading = signal<boolean>(false)
  protected performanceDataIndicators = signal<
    GetUserWalletsPerformanceIndicatorsDTO | null | undefined
  >(undefined)
  protected performanceDataSeries = signal<GetUserWalletsPerformanceSerieDTO[] | null | undefined>(
    undefined
  )

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
          return this._investmentsGatewayService.getUserWalletsPerformance({
            walletIds,
            selectedCurrency,
          })
        })
      )
      .subscribe({
        next: response => {
          this.investmentsService.handleSelectedWalletIdsChange(response.data.walletIds)
          this.investmentsService.currencyToShow.set(response.data.currencyToShow as Currency)
          this.performanceDataIndicators.set(response.data.indicators)
          this.performanceDataSeries.set(response.data.series)
          this.loading.set(false)
        },
        error: () => {
          this.performanceDataIndicators.set(null)
          this.performanceDataSeries.set(null)
          this.loading.set(false)
        },
      })
  }

  ngOnDestroy(): void {
    this._investmentsSubscription?.unsubscribe()
  }
}
