import { Component, computed, inject, OnDestroy, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { AnalyticSerie } from '@kdongs/domain/dto/investment/analytic/liquidation-series-dto'
import Big from 'big.js'
import { combineLatest, debounceTime, filter, Subscription, switchMap, tap } from 'rxjs'
import { InvestmentsGatewayService } from '../../../../../../infra/gateways/investments/investments-gateway.service'
import { LoadingBar } from '../../../../components/loading-bar/loading-bar'
import { PerformanceService } from '../performance.service'
import { EvolutionSeries } from './evolution-series/evolution-series'
import { GroupSeries } from './group-series/group-series'
import { UnifiedAnalyticSerieDataPoint } from './performance-series.model'

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
    } @else if (performanceService.currencyToShow() !== undefined && series() !== undefined) {
      <div class="flex flex-col gap-6">
        <span class="text-2xl font-medium text-lime-500 select-none">Evolution Charts</span>
        <div class="info-card">
          <div class="info-content flex items-center">
            <i class="fa-solid fa-circle-info"></i>
            <span class="ml-2">
              <kbd class="kbd">Alt</kbd> click on a chart dataset to isolate it. Normal click to
              hide only it.
            </span>
          </div>
        </div>
        <kdongs-evolution-series
          [data]="series()!"
          [unifiedData]="unifiedSeries()!"
          [currencyOnUse]="performanceService.currencyToShow()!"
        />
        <kdongs-group-series
          [data]="series()!"
          [unifiedData]="unifiedSeries()!"
          [currencyOnUse]="performanceService.currencyToShow()!"
        />
      </div>
    }
  `,
})
export class PerformanceSeries implements OnDestroy {
  /**
   * SERVICES
   */
  protected readonly performanceService = inject(PerformanceService)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)

  /**
   * SIGNALS
   */
  protected loading = signal<boolean>(false)
  /**
   * IMPORTANT: Wallet dataPoints received from the backend will be aggregated by dataPoint[type] and dataPoint[dateUtc],
   * meaning, types will not be mixed, only same dates from the same types will be aggregated.
   */
  protected series = signal<AnalyticSerie[] | null | undefined>(undefined)
  protected unifiedSeries = computed<UnifiedAnalyticSerieDataPoint[] | null | undefined>(() => {
    if (this.series() === undefined) return undefined
    else if (this.series() === null) return null
    return this._unifySeries(this.series()!)
  })

  /**
   * VARS
   */
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    const selectedWalletIds$ = toObservable(this.performanceService.selectedWalletIds)
    const currencyToShow$ = toObservable(this.performanceService.currencyToShow)

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

  /**
   * FUNCTIONS
   */

  /**
   * Generate a unified dataset, merging all wallets' assets in a single timeline.
   *
   * Since this will aggregate different wallets and dataPoint types, by `dateUtc`, there is no need to maintain `type` property.
   */
  private _unifySeries(data: AnalyticSerie[]): UnifiedAnalyticSerieDataPoint[] {
    let unifiedSeriesMap = new Map<number, UnifiedAnalyticSerieDataPoint>()
    for (const wallet of data) {
      for (const dataPoint of wallet.dataPoints) {
        // Merge wallet assets into a Map, to merge equal dates to same dataPoint
        if (unifiedSeriesMap.has(dataPoint.dateUtc)) {
          const previousMapValue = unifiedSeriesMap.get(dataPoint.dateUtc)!
          unifiedSeriesMap.set(dataPoint.dateUtc, {
            dateUtc: dataPoint.dateUtc,
            inputAmount: new Big(previousMapValue.inputAmount)
              .add(dataPoint.inputAmount)
              .round(2, Big.roundHalfUp)
              .toNumber(),
            grossAmount: new Big(previousMapValue.grossAmount)
              .add(dataPoint.grossAmount)
              .round(2, Big.roundHalfUp)
              .toNumber(),
            netAmount: new Big(previousMapValue.netAmount)
              .add(dataPoint.netAmount)
              .round(2, Big.roundHalfUp)
              .toNumber(),
            costsAndTaxes: new Big(previousMapValue.costsAndTaxes)
              .add(dataPoint.costsAndTaxes)
              .round(2, Big.roundHalfUp)
              .toNumber(),
            daysRunning: new Big(previousMapValue.daysRunning)
              .add(dataPoint.daysRunning)
              .round(2, Big.roundHalfUp)
              .toNumber(),
          })
        } else
          unifiedSeriesMap.set(dataPoint.dateUtc, {
            dateUtc: dataPoint.dateUtc,
            inputAmount: dataPoint.inputAmount,
            grossAmount: dataPoint.grossAmount,
            netAmount: dataPoint.netAmount,
            costsAndTaxes: dataPoint.costsAndTaxes,
            daysRunning: dataPoint.daysRunning,
          })
      }
    }

    let unifiedSeries = Array.from(unifiedSeriesMap.values())
    // Sort by date ascending
    unifiedSeries.sort((a, b) => a.dateUtc - b.dateUtc)

    return unifiedSeries
  }
}
