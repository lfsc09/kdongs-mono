import { Component, input } from '@angular/core'
import { GetUserWalletsPerformanceSerieDTO } from '../../../../../../infra/gateways/investments/investments-gateway.model'
import { LoadingBar } from '../../../../components/loading-bar/loading-bar'
import { Currency } from '../../investments.model'

@Component({
  selector: 'kdongs-performance-group',
  templateUrl: './performance-group.html',
  imports: [LoadingBar],
})
export class PerformanceGroup {
  /**
   * SIGNALS
   */
  loading = input.required<boolean>()
  currencyOnUse = input.required<Currency | 'Unknown'>()
  data = input.required<GetUserWalletsPerformanceSerieDTO[] | null | undefined>()
}
