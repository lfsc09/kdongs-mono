import { Injectable } from '@angular/core'
import Big from 'big.js'
import { area, line } from 'billboard.js'
import cloneDeep from 'lodash/cloneDeep'
import { LiquidationSerieDTO } from '../../../../../../../infra/gateways/investments/investments-gateway.model'
import { UnifiedLiquidationSerieDataPointDTO } from '../performance-series.model'
import {
  ChartDataSerie,
  ChartGeneratedData,
  ForecastDeltaPoint,
  TendencyType,
} from './evolution-series.model'

@Injectable()
export class EvolutionSeriesService {
  /**
   * CONSTS
   */
  // 30 days in milliseconds
  private _thirdyDaysMS = 1000 * 60 * 60 * 24 * 30
  private _forecast = {
    halfLifeDays: 45,
    cutoffDays: 180,
    steps: 2,
  }
  private _tendenciesValues = {
    shorter: { short: 5, long: 20 },
    longer: { short: 21, long: 100 },
  }

  /**
   * FUNCTIONS
   */

  chartDataUnifiedWallets(
    dataSerie: UnifiedLiquidationSerieDataPointDTO[],
    showProfitsOnly: boolean,
    tendencyType: TendencyType
  ): ChartGeneratedData {
    if (dataSerie.length === 0) return {} as ChartGeneratedData

    const columnName = showProfitsOnly ? 'Summed Net' : 'Summed Balance'
    let evolutionColumn: ChartDataSerie = [columnName]
    let xAxis: ChartDataSerie = ['x']
    let evolutionValue = new Big(0)

    for (const dataPoint of dataSerie) {
      xAxis.push(dataPoint.dateUtc)
      evolutionValue = evolutionValue
        .add(dataPoint.netAmount)
        .add(showProfitsOnly ? 0 : dataPoint.inputAmount)
      evolutionColumn.push(evolutionValue.round(2, Big.roundHalfUp).toNumber())
    }

    const forecastValues = this._forecastHybrid(
      dataSerie,
      this._forecast.halfLifeDays,
      this._forecast.cutoffDays,
      this._forecast.steps
    )
    const now = new Date().getTime()
    for (let fIdx = 1; fIdx <= this._forecast.steps; fIdx++) {
      xAxis.push(now + this._thirdyDaysMS * fIdx)
      evolutionValue = evolutionValue.add(forecastValues[fIdx - 1])
      evolutionColumn.push(evolutionValue.round(2, Big.roundHalfUp).toNumber())
    }

    return {
      data: {
        x: 'x',
        columns: [xAxis, evolutionColumn],
        types: {
          [columnName]: area(),
        },
        regions: {
          [columnName]: [{ start: xAxis.at(-3), style: { dasharray: '4 4' } }],
        },
      },
      classes: ['billboard-lines-thick', 'billboard-lines-thick'],
      area: {
        linearGradient: true,
      },
    }
  }

  chartDataSeparatedWallets(
    dataSeries: LiquidationSerieDTO[],
    compareNetOnly: boolean
  ): ChartGeneratedData {
    if (dataSeries.length === 0) return {} as ChartGeneratedData

    let dataColumns: ChartDataSerie[] = []
    let dataXSMap: { [key: string]: string } = {}
    let dataRegions: { [key: string]: any[] } = {}
    let dataClasses: string[] = []

    for (const [idx, serie] of dataSeries.entries()) {
      if (serie.dataPoints.length === 0) continue

      let evolutionColumns: {
        net: ChartDataSerie
        input?: ChartDataSerie
        gross?: ChartDataSerie
      } = {
        net: [`Net ${serie.walletName}`],
        ...(!compareNetOnly ? { input: [`Input ${serie.walletName}`] } : {}),
        ...(!compareNetOnly ? { gross: [`Gross ${serie.walletName}`] } : {}),
      }
      let xAxis: ChartDataSerie = [`x${idx}`]
      let evolutionValues = {
        net: new Big(0),
        ...(!compareNetOnly ? { input: new Big(0) } : {}),
        ...(!compareNetOnly ? { gross: new Big(0) } : {}),
      }

      dataXSMap[serie.walletName] = `x${idx}`
      dataClasses.push('billboard-lines-thick')

      for (let dataPoint of serie.dataPoints) {
        xAxis.push(dataPoint.dateUtc)
        evolutionValues.net = evolutionValues.net.add(dataPoint.netAmount)
        evolutionColumns.net.push(evolutionValues.net.round(2, Big.roundHalfUp).toNumber())
        if (!compareNetOnly) {
          evolutionValues.input = evolutionValues.input!.add(dataPoint.inputAmount)
          evolutionValues.gross = evolutionValues.gross!.add(dataPoint.grossAmount)
          evolutionColumns.input!.push(evolutionValues.input!.round(2, Big.roundHalfUp).toNumber())
          evolutionColumns.gross!.push(evolutionValues.gross!.round(2, Big.roundHalfUp).toNumber())
        }
      }

      const forecastValues = {
        net: this._forecastHybrid(
          serie.dataPoints,
          this._forecast.halfLifeDays,
          this._forecast.cutoffDays,
          this._forecast.steps
        ),
        ...(!compareNetOnly
          ? {
              gross: this._forecastHybrid(
                serie.dataPoints.map(dp => ({ ...dp, netAmount: dp.grossAmount })),
                this._forecast.halfLifeDays,
                this._forecast.cutoffDays,
                this._forecast.steps
              ),
            }
          : {}),
      }
      const now = new Date().getTime()

      for (let fIdx = 1; fIdx <= this._forecast.steps; fIdx++) {
        xAxis.push(now + this._thirdyDaysMS * fIdx)
        evolutionColumns.net.push(forecastValues.net[fIdx - 1])
        if (!compareNetOnly) {
          evolutionColumns.input!.push(null)
          evolutionColumns.gross!.push(forecastValues.gross![fIdx - 1])
        }
      }

      dataColumns.push(...Object.values(evolutionColumns))
      dataColumns.push([...xAxis])
      dataRegions[evolutionColumns.net[0]] = [{ start: xAxis.at(-3), style: { dasharray: '4 4' } }]
      if (!compareNetOnly) {
        dataRegions[evolutionColumns.gross![0]] = [
          { start: xAxis.at(-3), style: { dasharray: '4 4' } },
        ]
      }
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

  /**
   * Forecast next values using a hybrid method that combines Linear Regression and Exponential Smoothing, giving more weight to recent data.
   *
   * @param deltas: The data serie to be forecasted, ordered by date ascending.
   * @param halfLifeDays: The number of days for the weight to reduce by half. For example, if 30, the data from 30 days ago will have half the weight of the most recent data.
   * @param cutoffDays: The number of days after which the data will be ignored for the forecast. For example, if 90, the data from more than 90 days ago will not be considered in the forecast.
   * @param steps: The number of future points to forecast.
   * @return An array of forecasted values for the next `steps` points.
   */
  private _forecastHybrid(
    deltas: ForecastDeltaPoint[],
    halfLifeDays: number,
    cutoffDays: number,
    steps: number
  ): number[] {
    const lrs = this._forecastLinearRegression(deltas, halfLifeDays, cutoffDays, steps)
    const ess = this._forecastExpSmoothing(deltas, halfLifeDays, cutoffDays, steps)

    let hybridForecast: number[] = []
    for (let i = 0; i < steps; i++) {
      hybridForecast.push((lrs[i] + ess[i]) / 2)
    }
    return hybridForecast
  }

  /**
   * Forecast next values using Exponential Smoothing method, giving more weight to recent data.
   *
   * @param deltas: The data serie to be forecasted, ordered by date ascending.
   * @param halfLifeDays: The number of days for the weight to reduce by half. For example, if 30, the data from 30 days ago will have half the weight of the most recent data.
   * @param cutoffDays: The number of days after which the data will be ignored for the forecast. For example, if 90, the data from more than 90 days ago will not be considered in the forecast.
   * @param steps: The number of future points to forecast.
   * @return An array of forecasted values for the next `steps` points.
   */
  private _forecastExpSmoothing(
    deltas: ForecastDeltaPoint[],
    halfLifeDays: number,
    cutoffDays: number,
    steps: number
  ): number[] {
    const now = new Date().getTime()
    const halfLifeMillis = halfLifeDays * 24 * 60 * 60 * 1000
    const cutoffMillis = cutoffDays * 24 * 60 * 60 * 1000
    const lambda = Math.log(2) / halfLifeMillis
    let smoothedValues: number[] = []
    let lastSmoothedValue = deltas[0].netAmount

    for (let i = 1; i < deltas.length; i++) {
      const dt = now - deltas[i].dateUtc

      // If the data point is older than the cutoff, ignore it
      if (dt > cutoffMillis) {
        continue
      }

      const alpha = 1 - Math.exp(-lambda * dt)
      const smoothedValue = alpha * deltas[i].netAmount + (1 - alpha) * lastSmoothedValue
      smoothedValues.push(smoothedValue)
      lastSmoothedValue = smoothedValue
    }

    return smoothedValues.slice(-steps)
  }

  /**
   * Forecast next values using Linear Regression method, giving more weight to recent data through an exponential decay function.
   *
   * @param deltas: The data serie to be forecasted, ordered by date ascending.
   * @param halfLifeDays: The number of days for the weight to reduce by half. For example, if 30, the data from 30 days ago will have half the weight of the most recent data.
   * @param cutoffDays: The number of days after which the data will be ignored for the forecast. For example, if 90, the data from more than 90 days ago will not be considered in the forecast.
   * @param steps: The number of future points to forecast.
   * @return An array of forecasted values for the next `steps` points.
   */
  private _forecastLinearRegression(
    deltas: ForecastDeltaPoint[],
    halfLifeDays: number,
    cutoffDays: number,
    steps: number
  ): number[] {
    const now = new Date().getTime()
    const halfLifeMillis = halfLifeDays * 24 * 60 * 60 * 1000
    const cutoffMillis = cutoffDays * 24 * 60 * 60 * 1000
    const lambda = Math.log(2) / halfLifeMillis

    let weightedSumX = 0
    let weightedSumY = 0
    let weightedSumXY = 0
    let weightedSumXX = 0
    let totalWeight = 0

    for (let i = 0; i < deltas.length; i++) {
      const dt = now - deltas[i].dateUtc

      // If the data point is older than the cutoff, ignore it
      if (dt > cutoffMillis) {
        continue
      }

      const weight = Math.exp(-lambda * dt)
      weightedSumX += weight * deltas[i].dateUtc
      weightedSumY += weight * deltas[i].netAmount
      weightedSumXY += weight * deltas[i].dateUtc * deltas[i].netAmount
      weightedSumXX += weight * deltas[i].dateUtc * deltas[i].dateUtc
      totalWeight += weight
    }

    const slope =
      (totalWeight * weightedSumXY - weightedSumX * weightedSumY) /
      (totalWeight * weightedSumXX - weightedSumX * weightedSumX)
    const intercept = (weightedSumY - slope * weightedSumX) / totalWeight

    let forecast: number[] = []
    const lastDate = deltas[deltas.length - 1].dateUtc
    for (let i = 1; i <= steps; i++) {
      const futureDate = lastDate + this._thirdyDaysMS * i
      const predictedValue = intercept + slope * futureDate
      forecast.push(predictedValue)
    }
    return forecast
  }
}
