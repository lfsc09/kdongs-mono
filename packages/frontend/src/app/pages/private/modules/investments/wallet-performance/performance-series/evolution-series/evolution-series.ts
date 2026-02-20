import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu'
import { formatDate } from '@angular/common'
import { Component, effect, inject, input, OnDestroy, signal } from '@angular/core'
import bb, { Chart, ChartOptions } from 'billboard.js'
import { LiquidationSerieDTO } from '../../../../../../../infra/gateways/investments/investments-gateway.model'
import { CapitalizePipe } from '../../../../../../../infra/pipes/capitalize.pipe'
import { formatMonetary } from '../../../../../../../infra/pipes/monetary.pipe'
import { Currency } from '../../../investments.model'
import { UnifiedLiquidationSerieDataPointDTO } from '../performance-series.model'
import { ChartGeneratedData, TendencyType } from './evolution-series.model'
import { EvolutionSeriesService } from './evolution-series.service'

@Component({
  selector: 'kdongs-evolution-series',
  templateUrl: './evolution-series.html',
  imports: [CdkMenuTrigger, CdkMenu, CapitalizePipe],
  providers: [EvolutionSeriesService],
})
export class EvolutionSeries implements OnDestroy {
  /**
   * SERVICES
   */
  private readonly _evolutionSeriesService = inject(EvolutionSeriesService)

  /**
   * SIGNALS
   */
  currencyOnUse = input.required<Currency>()
  data = input.required<LiquidationSerieDTO[]>()
  unifiedData = input.required<UnifiedLiquidationSerieDataPointDTO[]>()
  protected unifyDatasets = signal<boolean>(true)
  protected showProfitsOnly = signal<boolean>(false)
  protected compareNetOnly = signal<boolean>(true)
  protected tendencyType = signal<TendencyType>(TendencyType.Shorter)

  /**
   * VARS
   */
  private _chartInstance: Chart | undefined = undefined
  private _chartConfigs: ChartOptions = {
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: (value: string | number) => {
            return formatDate(value, 'MMM yy', 'en_US')
          },
          culling: {
            lines: false,
          },
        },
      },
      y: {
        tick: {
          culling: {
            lines: false,
          },
        },
      },
    },
    grid: { y: { show: true } },
    legend: {
      contents: {
        bindto: '#evolutionChartLegend',
        template: (id: string, color: string) => {
          return `<span class="flex flex-row items-center justify-center gap-1.5 p-2 rounded-lg bg-background-0">
            <span class="rounded-full h-2 w-2" style="background-color:${color}"></span>
            <span class="text-xs">${id}</span>
          </span>`
        },
      },
    },
    line: {
      classes: ['billboard-lines-thick'],
    },
    padding: {
      right: 20,
    },
    point: {
      focus: {
        only: true,
      },
    },
    tooltip: {
      format: {
        title: (title: number | string) => {
          return formatDate(title, 'dd MMM yy', 'en_US')
        },
      },
    },
    bindto: '#evolutionChart',
  }

  constructor() {
    effect(() => {
      let newChartDataConfig: ChartGeneratedData = {} as ChartGeneratedData

      // Merge wallets' evolution, for chart with tendency lines (short & long) and bollinger bands
      if (this.unifyDatasets()) {
        newChartDataConfig = this._evolutionSeriesService.chartDataUnifiedWallets(
          this.unifiedData(),
          this.showProfitsOnly(),
          this.tendencyType()
        )
      }
      // Generate evolution of wallets separately (line for each wallet) (Net only or Input/Gross/Net)
      else {
        newChartDataConfig = this._evolutionSeriesService.chartDataSeparatedWallets(
          this.data(),
          this.compareNetOnly()
        )
      }

      // Configure the Y axis to show values in the selected currency format
      this._chartConfigs.axis!.y!.tick!.format = (value: unknown) => {
        if (typeof value === 'number' || typeof value === 'string')
          return formatMonetary(value, this.currencyOnUse(), 'code', '1.0-2', 'pt-BR')
        return `${value}`
      }
      // Configure data and classes per the generated chart data config
      this._chartConfigs.data = newChartDataConfig?.data ?? {}
      if (newChartDataConfig.classes !== undefined)
        this._chartConfigs.line!.classes = newChartDataConfig.classes
      if (newChartDataConfig.area !== undefined) this._chartConfigs.area = newChartDataConfig.area

      if (this._chartInstance) {
        this._chartInstance.destroy()
      }
      this._chartInstance = bb.generate(this._chartConfigs)
    })
  }

  ngOnDestroy(): void {
    if (this._chartInstance) {
      this._chartInstance.destroy()
    }
  }

  /**
   * FUNCTIONS
   */
  protected handleUnifyDatasets(): void {
    this.unifyDatasets.update(state => !state)
  }

  protected handleShowProfitsOnly(): void {
    this.showProfitsOnly.update(state => !state)
  }

  protected handleTendencyTypeChange(): void {
    this.tendencyType.update(state =>
      state === TendencyType.Shorter ? TendencyType.Longer : TendencyType.Shorter
    )
  }

  protected handleCompareNetOnly(): void {
    this.compareNetOnly.update(state => !state)
  }
}
