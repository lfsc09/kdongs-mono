import { formatCurrency, formatDate } from '@angular/common'
import { Injectable } from '@angular/core'
import bb, { area, ChartOptions, line } from 'billboard.js'
import cloneDeep from 'lodash/cloneDeep'
import {
  LiquidationSerieDataPointDTO,
  LiquidationSerieDTO,
} from '../../../../../../../infra/gateways/investments/investments-gateway.model'
import { Currency } from '../../../investments.model'
import { ChartDataSerie, ChartGeneratedData } from './evolution-series.model'

@Injectable()
export class EvolutionSeriesService {
  /**
   * CONSTS
   */
  private thirdyDaysMS = 2592000000 // 30 days in milliseconds
  private forecastTimes = 2
  private tendenciesValues = {
    shorter: { short: 5, long: 20 },
    longer: { short: 21, long: 100 },
  }

  /**
   * VARS
   */
  chartInstance: unknown = undefined
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
          return `<span class="flex flex-row items-center justify-center gap-1.5 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-700">
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

  /**
   * FUNCTIONS
   */
  chartGenerateOrUpdate(
    unifyDatasets: boolean,
    compareNetGross: boolean,
    currencyOnUse: Currency,
    data: LiquidationSerieDTO[]
  ): void {
    let chartDataConfig: ChartGeneratedData = {} as ChartGeneratedData
    // User selected to merge wallets' evolution
    if (unifyDatasets) {
      let unifiedSeries = this.unifyDataset(data)
      unifiedSeries.sort(
        (a: LiquidationSerieDataPointDTO, b: LiquidationSerieDataPointDTO) => a.dateUtc - b.dateUtc
      )
      // Generate comparison of Net & Gross profit
      if (compareNetGross) {
        chartDataConfig = this.chartDataUnifiedWalletsNetGrossProfits(unifiedSeries)
      } else {
        chartDataConfig = this.chartDataUnifiedWalletsNetWithTendency(unifiedSeries)
      }
    }
    // User selected to see evolution of wallets separately, so we generate a chart with a line for each wallet
    else {
      chartDataConfig = this.chartDataSeparatedWalletsNet(data)
    }

    // Update or generate the chart with the new config
    if (this.chartInstance) {
      this.chartConfigs.data = chartDataConfig?.data ?? {}
      if (chartDataConfig.classes !== undefined)
        this.chartConfigs.line!.classes = chartDataConfig.classes
      if (chartDataConfig.area !== undefined) this.chartConfigs.area = chartDataConfig.area
    } else {
      // Configure the Y axis to show values in the selected currency format
      this.chartConfigs.axis!.y!.tick!.format = (value: unknown) => {
        if (typeof value === 'number') return formatCurrency(value, 'pt-br', currencyOnUse, '0.0-2')
        return `${currencyOnUse} ${value}`
      }
      // Configure data and classes per the generated chart data config
      this.chartConfigs.data = chartDataConfig?.data ?? {}
      if (chartDataConfig.classes !== undefined)
        this.chartConfigs.line!.classes = chartDataConfig.classes
      if (chartDataConfig.area !== undefined) this.chartConfigs.area = chartDataConfig.area
      this.chartInstance = bb.generate(this.chartConfigs)
    }
  }

  /**
   * Generate a unified dataset, merging all wallets' assets in a single timeline.
   * And if two or more assets from different wallets have the same `exitTimestampUtc`, they will be merged in a single data point, summing their `netAmount`, `grossAmount` and `daysRunning`.
   */
  private unifyDataset(data: LiquidationSerieDTO[]): LiquidationSerieDataPointDTO[] {
    let unifiedSeriesMap = new Map<number, LiquidationSerieDataPointDTO>()
    for (let wallet of data) {
      for (let dataPoint of wallet.dataPoints) {
        // Merge wallet assets into a Map, to merge equal dates to same dataPoint
        if (unifiedSeriesMap.has(dataPoint.dateUtc)) {
          const previousMapValue = unifiedSeriesMap.get(dataPoint.dateUtc)
          unifiedSeriesMap.set(dataPoint.dateUtc, {
            ...dataPoint,
            grossAmount: previousMapValue!.grossAmount + dataPoint.grossAmount,
            netAmount: previousMapValue!.netAmount + dataPoint.netAmount,
          })
        } else unifiedSeriesMap.set(dataPoint.dateUtc, { ...dataPoint })
      }
    }
    return Array.from(unifiedSeriesMap.values())
  }

  /**
   * Generate Chart data and options for the `Unified Wallets Comparing Net & Gross Amounts`, which will calculate Net and Gross amounts of wallets unified.
   * This means that will take all the assets from the wallets and unify them in a single timeline.
   *
   * @param dataSerie: Will be the unified array of assets ordered by `date`.
   */
  private chartDataUnifiedWalletsNetGrossProfits(
    dataSerie: LiquidationSerieDataPointDTO[]
  ): ChartGeneratedData {
    if (dataSerie.length === 0) return {} as ChartGeneratedData
    let netEvolutionValue = 0
    let grossEvolutionValue = 0
    let netEvolution: ChartDataSerie = ['Summed Net Profit']
    let grossEvolution: ChartDataSerie = ['Summed Gross Profit']
    let xAxis: ChartDataSerie = ['x']
    let forecastAverage: {
      daysRunning: number
      netProfit: number
      grossProfit: number
      netProfitPerDay: number
      grossProfitPerDay: number
    } = {
      daysRunning: 0,
      netProfit: 0,
      grossProfit: 0,
      netProfitPerDay: 0,
      grossProfitPerDay: 0,
    }

    for (let dataPoint of dataSerie) {
      xAxis.push(dataPoint.dateUtc)
      netEvolutionValue += dataPoint.netAmount
      grossEvolutionValue += dataPoint.grossAmount
      netEvolution.push(netEvolutionValue.toFixed(2))
      grossEvolution.push(grossEvolutionValue.toFixed(2))
      forecastAverage.netProfit += dataPoint.netAmount
      forecastAverage.grossProfit += dataPoint.grossAmount
    }

    forecastAverage.daysRunning /= dataSerie.length
    forecastAverage.netProfit /= dataSerie.length
    forecastAverage.grossProfit /= dataSerie.length
    forecastAverage.netProfitPerDay = forecastAverage.netProfit / forecastAverage.daysRunning
    forecastAverage.grossProfitPerDay = forecastAverage.grossProfit / forecastAverage.daysRunning

    // Add a forecast of next data
    for (let fIdx = 1; fIdx <= this.forecastTimes; fIdx++) {
      xAxis.push(dataSerie.at(-1)!.dateUtc + this.thirdyDaysMS * fIdx)
      netEvolution.push(
        (netEvolutionValue + forecastAverage.netProfitPerDay * (30 * fIdx)).toFixed(2)
      )
      grossEvolution.push(
        (grossEvolutionValue + forecastAverage.grossProfitPerDay * (30 * fIdx)).toFixed(2)
      )
    }

    return {
      data: {
        x: 'x',
        columns: [xAxis, grossEvolution, netEvolution],
        types: {
          'Summed Gross Profit': area(),
          'Summed Net Profit': area(),
        },
        colors: {
          'Summed Gross Profit': '#f97316',
          'Summed Net Profit': '#22c55e',
        },
        regions: {
          'Summed Gross Profit': [{ start: xAxis.at(-3), style: { dasharray: '4 4' } }],
          'Summed Net Profit': [{ start: xAxis.at(-3), style: { dasharray: '4 4' } }],
        },
      },
      classes: ['billboard-lines-thick', 'billboard-lines-thick'],
      area: {
        linearGradient: true,
      },
    }
  }

  /**
   * Generate Chart data and options for the `Unified Wallets Net Profits with Tendency`, which will calculate Net profit of wallets unifed.
   * This means that will take all the assets from the wallets and unify them in a single timeline.
   *
   * @param dataSerie: Will be the unified array of assets ordered by `date`.
   */
  private chartDataUnifiedWalletsNetWithTendency(
    dataSerie: LiquidationSerieDataPointDTO[]
  ): ChartGeneratedData {
    if (dataSerie.length === 0) return {} as ChartGeneratedData
    let netEvolutionValue = 0
    let netEvolution: ChartDataSerie = ['Summed Net Profit']
    let xAxis: ChartDataSerie = ['x']
    let forecastAverage: {
      daysToProfit: number
      netProfit: number
      netProfitPerDay: number
    } = {
      daysToProfit: 0,
      netProfit: 0,
      netProfitPerDay: 0,
    }

    for (let dataPoint of dataSerie) {
      xAxis.push(dataPoint.dateUtc)
      netEvolutionValue += dataPoint.netAmount
      netEvolution.push(netEvolutionValue.toFixed(2))
      forecastAverage.netProfit += dataPoint.netAmount
    }

    forecastAverage.daysToProfit /= dataSerie.length
    forecastAverage.netProfit /= dataSerie.length
    forecastAverage.netProfitPerDay = forecastAverage.netProfit / forecastAverage.daysToProfit

    /**
     * TODO: Add the two tendency lines.
     */

    // Add a forecast of next data
    for (let fIdx = 1; fIdx <= this.forecastTimes; fIdx++) {
      xAxis.push(dataSerie.at(-1)!.dateUtc + this.thirdyDaysMS * fIdx)
      netEvolution.push(
        (netEvolutionValue + forecastAverage.netProfitPerDay * (30 * fIdx)).toFixed(2)
      )
    }

    return {
      data: {
        x: 'x',
        columns: [xAxis, netEvolution],
        types: {
          'Summed Net Profit': area(),
        },
        regions: {
          'Summed Net Profit': [{ start: xAxis.at(-3), style: { dasharray: '4 4' } }],
        },
      },
      classes: ['billboard-lines-thick'],
      area: {
        linearGradient: true,
      },
    }
  }

  /**
   * Generate Chart data and options for the `Separate Wallets Net Profits`, which will calculate Net profit of each wallet individualy.
   */
  private chartDataSeparatedWalletsNet(data: LiquidationSerieDTO[]): ChartGeneratedData {
    if (data.length === 0) return {} as ChartGeneratedData
    let dataColumns: ChartDataSerie[] = []
    let dataXSMap: { [key: string]: string } = {}
    let dataRegions: { [key: string]: any[] } = {}
    let dataClasses: string[] = []

    for (let [idx, serie] of data.entries()) {
      if (serie.dataPoints.length === 0) continue
      let netEvolutionValue = 0
      let netEvolution: ChartDataSerie = [serie.walletName]
      let xAxis: ChartDataSerie = [`x${idx}`]
      let forecastAverage: {
        daysToProfit: number
        netProfit: number
        netProfitPerDay: number
      } = {
        daysToProfit: 0,
        netProfit: 0,
        netProfitPerDay: 0,
      }

      dataXSMap[serie.walletName] = `x${idx}`
      dataClasses.push('billboard-lines-thick')

      for (let dataPoint of serie.dataPoints) {
        xAxis.push(dataPoint.dateUtc)
        netEvolutionValue += dataPoint.netAmount
        netEvolution.push(netEvolutionValue.toFixed(2))
        forecastAverage.netProfit += dataPoint.netAmount
      }

      forecastAverage.daysToProfit /= serie.dataPoints.length
      forecastAverage.netProfit /= serie.dataPoints.length
      forecastAverage.netProfitPerDay = forecastAverage.netProfit / forecastAverage.daysToProfit

      // Add a forecast of next data
      for (let fIdx = 1; fIdx <= this.forecastTimes; fIdx++) {
        xAxis.push(serie.dataPoints.at(-1)!.dateUtc + this.thirdyDaysMS * fIdx)
        netEvolution.push(
          (netEvolutionValue + forecastAverage.netProfitPerDay * (30 * fIdx)).toFixed(2)
        )
      }
      dataColumns.push([...netEvolution])
      dataColumns.push([...xAxis])
      dataRegions[serie.walletName] = [{ start: xAxis.at(-3), style: { dasharray: '4 4' } }]
    }

    return {
      data: {
        xs: { ...dataXSMap },
        columns: dataColumns,
        type: line(),
        regions: cloneDeep(dataRegions),
      },
      classes: [...dataClasses],
    }
  }
}
