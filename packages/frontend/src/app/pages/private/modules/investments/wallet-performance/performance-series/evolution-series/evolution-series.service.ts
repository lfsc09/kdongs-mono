import { formatDate } from '@angular/common'
import { Injectable } from '@angular/core'
import Big from 'big.js'
import bb, { area, ChartOptions, line } from 'billboard.js'
import cloneDeep from 'lodash/cloneDeep'
import { LiquidationSerieDTO } from '../../../../../../../infra/gateways/investments/investments-gateway.model'
import { formatMonetary } from '../../../../../../../infra/pipes/monetary.pipe'
import { Currency } from '../../../investments.model'
import {
  ChartDataSerie,
  ChartGeneratedData,
  UnifiedLiquidationSerieDataPointDTO,
} from './evolution-series.model'

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
        (a: UnifiedLiquidationSerieDataPointDTO, b: UnifiedLiquidationSerieDataPointDTO) =>
          a.dateUtc - b.dateUtc
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
        if (typeof value === 'number' || typeof value === 'string')
          return formatMonetary(value, currencyOnUse, 'code', '1.0-2', 'pt-BR')
        return `${value}`
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
   *
   * Since this will aggregate different wallets and dataPoint types, by `dateUtc`, there is no need to maintain `type` property.
   */
  private unifyDataset(data: LiquidationSerieDTO[]): UnifiedLiquidationSerieDataPointDTO[] {
    let unifiedSeriesMap = new Map<number, UnifiedLiquidationSerieDataPointDTO>()
    for (let wallet of data) {
      for (let dataPoint of wallet.dataPoints) {
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
    return Array.from(unifiedSeriesMap.values())
  }

  /**
   * Generate Chart data and options for the `Unified Wallets Comparing Net & Gross Amounts`, which will calculate Net and Gross amounts of wallets unified.
   * This means that will take all the assets from the wallets and unify them in a single timeline.
   *
   * @param dataSerie: Will be the unified array of assets ordered by `date`.
   */
  private chartDataUnifiedWalletsNetGrossProfits(
    dataSerie: UnifiedLiquidationSerieDataPointDTO[]
  ): ChartGeneratedData {
    if (dataSerie.length === 0) return {} as ChartGeneratedData
    let netEvolutionValue = new Big(0)
    let grossEvolutionValue = new Big(0)
    let netEvolution: ChartDataSerie = ['Summed Net Profit']
    let grossEvolution: ChartDataSerie = ['Summed Gross Profit']
    let xAxis: ChartDataSerie = ['x']
    let forecastAverage: {
      daysRunning: Big
      netProfit: Big
      grossProfit: Big
      netProfitPerDay: Big
      grossProfitPerDay: Big
    } = {
      daysRunning: new Big(0),
      netProfit: new Big(0),
      grossProfit: new Big(0),
      netProfitPerDay: new Big(0),
      grossProfitPerDay: new Big(0),
    }

    for (let dataPoint of dataSerie) {
      xAxis.push(dataPoint.dateUtc)
      netEvolutionValue = netEvolutionValue.add(dataPoint.netAmount)
      grossEvolutionValue = grossEvolutionValue.add(dataPoint.grossAmount)
      netEvolution.push(netEvolutionValue.toFixed(2))
      grossEvolution.push(grossEvolutionValue.toFixed(2))
      forecastAverage.netProfit = forecastAverage.netProfit.add(dataPoint.netAmount)
      forecastAverage.grossProfit = forecastAverage.grossProfit.add(dataPoint.grossAmount)
      forecastAverage.daysRunning = forecastAverage.daysRunning.add(dataPoint.daysRunning)
    }

    forecastAverage.daysRunning = forecastAverage.daysRunning.div(dataSerie.length)
    forecastAverage.netProfit = forecastAverage.netProfit.div(dataSerie.length)
    forecastAverage.grossProfit = forecastAverage.grossProfit.div(dataSerie.length)
    forecastAverage.netProfitPerDay = forecastAverage.netProfit.div(forecastAverage.daysRunning)
    forecastAverage.grossProfitPerDay = forecastAverage.grossProfit.div(forecastAverage.daysRunning)

    // Add a forecast of next data
    for (let fIdx = 1; fIdx <= this.forecastTimes; fIdx++) {
      xAxis.push(dataSerie.at(-1)!.dateUtc + this.thirdyDaysMS * fIdx)
      netEvolution.push(
        netEvolutionValue
          .add(forecastAverage.netProfitPerDay.mul(30 * fIdx))
          .round(2, Big.roundHalfUp)
          .toFixed(2)
      )
      grossEvolution.push(
        grossEvolutionValue
          .add(forecastAverage.grossProfitPerDay.mul(30 * fIdx))
          .round(2, Big.roundHalfUp)
          .toFixed(2)
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
    dataSerie: UnifiedLiquidationSerieDataPointDTO[]
  ): ChartGeneratedData {
    if (dataSerie.length === 0) return {} as ChartGeneratedData
    let netEvolutionValue = new Big(0)
    let netEvolution: ChartDataSerie = ['Summed Net Profit']
    let xAxis: ChartDataSerie = ['x']
    let forecastAverage: {
      daysRunning: Big
      netProfit: Big
      netProfitPerDay: Big
    } = {
      daysRunning: new Big(0),
      netProfit: new Big(0),
      netProfitPerDay: new Big(0),
    }

    for (let dataPoint of dataSerie) {
      xAxis.push(dataPoint.dateUtc)
      netEvolutionValue = netEvolutionValue.add(dataPoint.netAmount)
      netEvolution.push(netEvolutionValue.toFixed(2))
      forecastAverage.netProfit = forecastAverage.netProfit.add(dataPoint.netAmount)
      forecastAverage.daysRunning = forecastAverage.daysRunning.add(dataPoint.daysRunning)
    }

    forecastAverage.daysRunning = forecastAverage.daysRunning.div(dataSerie.length)
    forecastAverage.netProfit = forecastAverage.netProfit.div(dataSerie.length)
    forecastAverage.netProfitPerDay = forecastAverage.netProfit.div(forecastAverage.daysRunning)

    /**
     * TODO: Add the two tendency lines.
     */

    // Add a forecast of next data
    for (let fIdx = 1; fIdx <= this.forecastTimes; fIdx++) {
      xAxis.push(dataSerie.at(-1)!.dateUtc + this.thirdyDaysMS * fIdx)
      netEvolution.push(
        netEvolutionValue
          .add(forecastAverage.netProfitPerDay.mul(30 * fIdx))
          .round(2, Big.roundHalfUp)
          .toFixed(2)
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
      let netEvolutionValue = new Big(0)
      let netEvolution: ChartDataSerie = [serie.walletName]
      let xAxis: ChartDataSerie = [`x${idx}`]
      let forecastAverage: {
        daysRunning: Big
        netProfit: Big
        netProfitPerDay: Big
      } = {
        daysRunning: new Big(0),
        netProfit: new Big(0),
        netProfitPerDay: new Big(0),
      }

      dataXSMap[serie.walletName] = `x${idx}`
      dataClasses.push('billboard-lines-thick')

      for (let dataPoint of serie.dataPoints) {
        xAxis.push(dataPoint.dateUtc)
        netEvolutionValue = netEvolutionValue.add(dataPoint.netAmount)
        netEvolution.push(netEvolutionValue.toFixed(2))
        forecastAverage.netProfit = forecastAverage.netProfit.add(dataPoint.netAmount)
        forecastAverage.daysRunning = forecastAverage.daysRunning.add(dataPoint.daysRunning)
      }

      forecastAverage.daysRunning = forecastAverage.daysRunning.div(serie.dataPoints.length)
      forecastAverage.netProfit = forecastAverage.netProfit.div(serie.dataPoints.length)
      forecastAverage.netProfitPerDay = forecastAverage.netProfit.div(forecastAverage.daysRunning)

      // Add a forecast of next data
      for (let fIdx = 1; fIdx <= this.forecastTimes; fIdx++) {
        xAxis.push(serie.dataPoints.at(-1)!.dateUtc + this.thirdyDaysMS * fIdx)
        netEvolution.push(
          netEvolutionValue
            .add(forecastAverage.netProfitPerDay.mul(30 * fIdx))
            .round(2, Big.roundHalfUp)
            .toFixed(2)
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
