import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu'
import { formatDate } from '@angular/common'
import { Component, effect, inject, input, OnDestroy, signal } from '@angular/core'
import bb, { Chart, ChartOptions } from 'billboard.js'
import { LiquidationSerieDTO } from '../../../../../../../infra/gateways/investments/investments-gateway.model'
import { formatMonetary } from '../../../../../../../infra/pipes/monetary.pipe'
import { Currency } from '../../../investments.model'
import { ChartGeneratedData, UnifiedLiquidationSerieDataPointDTO } from './evolution-series.model'
import { EvolutionSeriesService } from './evolution-series.service'

@Component({
  selector: 'kdongs-evolution-series',
  templateUrl: './evolution-series.html',
  imports: [CdkMenuTrigger, CdkMenu],
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
  protected unifyDatasets = signal<boolean>(true)
  protected compareNetGross = signal<boolean>(false)

  /**
   * VARS
   */
  chartInstance: Chart | undefined = undefined
  chartConfigs: ChartOptions = {
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

      // Merge wallets' evolution
      if (this.unifyDatasets()) {
        let unifiedSeries = this._evolutionSeriesService.unifyDataset(this.data())
        unifiedSeries.sort(
          (a: UnifiedLiquidationSerieDataPointDTO, b: UnifiedLiquidationSerieDataPointDTO) =>
            a.dateUtc - b.dateUtc
        )
        // Generate comparison of Net & Gross profit
        if (this.compareNetGross()) {
          newChartDataConfig =
            this._evolutionSeriesService.chartDataUnifiedWalletsNetGrossProfits(unifiedSeries)
        } else {
          newChartDataConfig =
            this._evolutionSeriesService.chartDataUnifiedWalletsNetWithTendency(unifiedSeries)
        }
      }
      // Generate evolution of wallets separately (line for each wallet)
      else {
        newChartDataConfig = this._evolutionSeriesService.chartDataSeparatedWalletsNet(this.data())
      }

      // Configure the Y axis to show values in the selected currency format
      this.chartConfigs.axis!.y!.tick!.format = (value: unknown) => {
        if (typeof value === 'number' || typeof value === 'string')
          return formatMonetary(value, this.currencyOnUse(), 'code', '1.0-2', 'pt-BR')
        return `${value}`
      }
      // Configure data and classes per the generated chart data config
      this.chartConfigs.data = newChartDataConfig?.data ?? {}
      if (newChartDataConfig.classes !== undefined)
        this.chartConfigs.line!.classes = newChartDataConfig.classes
      if (newChartDataConfig.area !== undefined) this.chartConfigs.area = newChartDataConfig.area

      if (this.chartInstance) {
        this.chartInstance.destroy()
      }
      this.chartInstance = bb.generate(this.chartConfigs)
    })
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy()
    }
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
