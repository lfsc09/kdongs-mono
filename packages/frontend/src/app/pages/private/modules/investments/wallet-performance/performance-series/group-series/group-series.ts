import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu'
import { Component, computed, effect, inject, input, OnDestroy, signal } from '@angular/core'
import bb, { Chart, ChartOptions } from 'billboard.js'
import { LiquidationSerieDTO } from '../../../../../../../infra/gateways/investments/investments-gateway.model'
import { CapitalizePipe } from '../../../../../../../infra/pipes/capitalize.pipe'
import { formatMonetary } from '../../../../../../../infra/pipes/monetary.pipe'
import { formatPercent } from '../../../../../../../infra/pipes/percent.pipe'
import { Currency } from '../../../investments.model'
import { UnifiedLiquidationSerieDataPointDTO } from '../performance-series.model'
import { ChartGeneratedData, Timeframe, ValueType } from './group-series.model'
import { GroupSeriesService } from './group-series.service'

@Component({
  selector: 'kdongs-group-series',
  templateUrl: './group-series.html',
  imports: [CdkMenuTrigger, CdkMenu, CapitalizePipe],
  providers: [GroupSeriesService],
})
export class GroupSeries implements OnDestroy {
  /**
   * SERVICES
   */
  private readonly _groupSeriesService = inject(GroupSeriesService)

  /**
   * SIGNALS
   */
  currencyOnUse = input.required<Currency>()
  data = input.required<LiquidationSerieDTO[]>()
  unifiedData = input.required<UnifiedLiquidationSerieDataPointDTO[]>()
  protected unifyDatasets = signal<boolean>(true)
  protected groupTimeframe = signal<Timeframe>(Timeframe.Month)
  protected groupValueType = signal<ValueType>(ValueType.Currency)
  protected compareNetOnly = signal<boolean>(true)
  protected groupValueTypeLabel = computed(() => {
    if (this.groupValueType() === ValueType.Percentage) {
      return '%'
    } else {
      return this.currencyOnUse()
    }
  })

  /**
   * VARS
   */
  private _chartInstance: Chart | undefined = undefined
  private _chartConfigs: ChartOptions = {
    axis: {
      x: {
        type: 'category',
        tick: {
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
        bindto: '#groupChartLegend',
        template: (id: string, color: string) => {
          return `<span class="flex flex-row items-center justify-center gap-1.5 p-2 rounded-lg bg-background-0">
            <span class="rounded-full h-2 w-2" style="background-color:${color}"></span>
            <span class="text-xs">${id}</span>
          </span>`
        },
      },
    },
    bar: {
      linearGradient: true,
      padding: 3,
      radius: {
        ratio: 0.1,
      },
    },
    padding: {
      right: 20,
    },
    bindto: '#groupChart',
  }

  constructor() {
    effect(() => {
      let newChartDataConfig: ChartGeneratedData = {} as ChartGeneratedData

      // Merge wallets' evolution
      if (this.unifyDatasets()) {
        newChartDataConfig = this._groupSeriesService.chartDataUnifiedWallets(
          this.unifiedData(),
          this.groupTimeframe(),
          this.groupValueType(),
          this.compareNetOnly()
        )
      }
      // Generate evolution of wallets separately (line for each wallet)
      else {
        newChartDataConfig = this._groupSeriesService.chartDataSeparatedWallets(
          this.data(),
          this.groupTimeframe(),
          this.groupValueType(),
          this.compareNetOnly()
        )
      }

      // Configure the Y axis to show values in the selected currency format
      this._chartConfigs.axis!.y!.tick!.format = (value: unknown) => {
        if (this.groupValueType() === ValueType.Percentage) {
          if (typeof value === 'number' || typeof value === 'string')
            return formatPercent(value, '1.0-2', 'pt-BR')
          return `${value}`
        } else {
          if (typeof value === 'number' || typeof value === 'string')
            return formatMonetary(value, this.currencyOnUse(), 'code', '1.0-2', 'pt-BR')
          return `${value}`
        }
      }

      // Configure data and classes per the generated chart data config
      this._chartConfigs.data = newChartDataConfig?.data ?? {}

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

  protected handleGroupTimeFrameChange(): void {
    this.groupTimeframe.update(state => {
      switch (state) {
        case Timeframe.Month:
          return Timeframe.Quarter
        case Timeframe.Quarter:
          return Timeframe.Year
        case Timeframe.Year:
          return Timeframe.Month
        default:
          return state
      }
    })
  }

  protected handleGroupValueTypeChange(): void {
    this.groupValueType.update(state =>
      state === ValueType.Percentage ? ValueType.Currency : ValueType.Percentage
    )
  }

  protected handleCompareNetOnly(): void {
    this.compareNetOnly.update(state => !state)
  }
}
