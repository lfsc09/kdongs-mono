import { Component, input } from '@angular/core'
import { LiquidationSerieDTO } from '../../../../../../../infra/gateways/investments/investments-gateway.model'
import { Currency } from '../../../investments.model'

@Component({
  selector: 'kdongs-group-series',
  templateUrl: './group-series.html',
})
export class GroupSeries {
  /**
   * SIGNALS
   */
  currencyOnUse = input.required<Currency>()
  data = input.required<LiquidationSerieDTO[]>()
}
