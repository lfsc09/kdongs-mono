import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common'
import { Component, input } from '@angular/core'
import { GetUserWalletsPerformanceIndicatorsDTO } from '../../../../../../infra/gateways/investments/investments-gateway.model'
import { Gauge } from '../../../../components/gauge/gauge'
import { LoadingBar } from '../../../../components/loading-bar/loading-bar'
import { Currency } from '../../investments.model'

@Component({
  selector: 'kdongs-performance-indicator',
  templateUrl: './performance-indicator.html',
  imports: [DatePipe, CurrencyPipe, PercentPipe, LoadingBar, Gauge],
})
export class PerformanceIndicator {
  /**
   * SIGNALS
   */
  loading = input.required<boolean>()
  currencyOnUse = input.required<Currency | 'Unknown'>()
  data = input.required<GetUserWalletsPerformanceIndicatorsDTO | null | undefined>()
}
