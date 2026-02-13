import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu'
import { Component, effect, inject, input, signal } from '@angular/core'
import { LiquidationSerieDTO } from '../../../../../../../infra/gateways/investments/investments-gateway.model'
import { Currency } from '../../../investments.model'
import { EvolutionSeriesService } from './evolution-series.service'

@Component({
  selector: 'kdongs-evolution-series',
  templateUrl: './evolution-series.html',
  imports: [CdkMenuTrigger, CdkMenu],
  providers: [EvolutionSeriesService],
})
export class EvolutionSeries {
  /**
   * SERVICES
   */
  private readonly _evolutionSeriesService = inject(EvolutionSeriesService)

  /**
   * SIGNALS
   */
  currencyOnUse = input.required<Currency>()
  data = input.required<LiquidationSerieDTO[]>()
  protected unifyDatasets = signal<boolean>(true)
  protected compareNetGross = signal<boolean>(false)

  constructor() {
    effect(() => {
      this._evolutionSeriesService.chartGenerateOrUpdate(
        this.unifyDatasets(),
        this.compareNetGross(),
        this.currencyOnUse(),
        this.data()
      )
    })
  }

  /**
   * FUNCTIONS
   */
  protected handleUnifyDatasets(): void {
    this.unifyDatasets.update(state => !state)
    this.compareNetGross.set(false)
  }

  protected handleCompareNetGross(): void {
    this.compareNetGross.update(state => !state)
  }
}
