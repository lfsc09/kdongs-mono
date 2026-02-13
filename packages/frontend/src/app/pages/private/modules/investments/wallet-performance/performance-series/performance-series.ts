import { Component, inject, OnDestroy, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { combineLatest, debounceTime, filter, Subscription, switchMap, tap } from 'rxjs'
import { LiquidationSerieDTO } from '../../../../../../infra/gateways/investments/investments-gateway.model'
import { InvestmentsGatewayService } from '../../../../../../infra/gateways/investments/investments-gateway.service'
import { LoadingBar } from '../../../../components/loading-bar/loading-bar'
import { InvestmentsService } from '../../investments.service'
import { EvolutionSeries } from './evolution-series/evolution-series'
import { GroupSeries } from './group-series/group-series'

@Component({
  selector: 'kdongs-performance-series',
  imports: [LoadingBar, EvolutionSeries, GroupSeries],
  template: `
    @if (loading()) {
      <div class="loading-bar-box h-72 *:w-1/2!">
        <kdongs-cp-loading-bar size="md" />
      </div>
    } @else if (series() === null) {
      <div class="error-box h-72">
        <div class="error-content">
          <span class="emo-flip"></span>
          <span>Failed to load series</span>
        </div>
      </div>
    } @else if (investmentsService.currencyToShow() !== undefined && series() !== undefined) {
      <kdongs-evolution-series
        [data]="series()!"
        [currencyOnUse]="investmentsService.currencyToShow()!"
      />
      <kdongs-group-series
        [data]="series()!"
        [currencyOnUse]="investmentsService.currencyToShow()!"
      />
    }
  `,
})
export class PerformanceSeries implements OnDestroy {
  /**
   * SERVICES
   */
  protected readonly investmentsService = inject(InvestmentsService)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)

  /**
   * SIGNALS
   */
  protected loading = signal<boolean>(false)
  protected series = signal<LiquidationSerieDTO[] | null | undefined>(undefined)

  /**
   * VARS
   */
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    const selectedWalletIds$ = toObservable(this.investmentsService.selectedWalletIds)
    const currencyToShow$ = toObservable(this.investmentsService.currencyToShow)

    this._investmentsSubscription = combineLatest([selectedWalletIds$, currencyToShow$])
      .pipe(
        debounceTime(150),
        filter(
          ([walletIds, currencyToShow]) => walletIds.length > 0 && currencyToShow !== undefined
        ),
        tap(() => this.loading.set(true)),
        switchMap(([walletIds, currencyToShow]) => {
          return this._investmentsGatewayService.getLiquidationSeriesAnalytics({
            useLivePriceQuote: false,
            walletIds,
            selectedCurrency: currencyToShow!,
          })
        })
      )
      .subscribe({
        next: response => {
          this.series.set(response.data)
          this.loading.set(false)
        },
        error: (e: any) => {
          this.series.set(null)
          this.loading.set(false)
        },
      })
  }

  ngOnDestroy(): void {
    this._investmentsSubscription?.unsubscribe()
  }
}
