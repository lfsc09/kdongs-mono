import { formatDate } from '@angular/common'
import { Injectable } from '@angular/core'
import Big from 'big.js'
import { bar } from 'billboard.js'
import { cloneDeep } from 'lodash'
import { DateTime } from 'luxon'
import { LiquidationSerieDTO } from '../../../../../../../infra/gateways/investments/investments-gateway.model'
import { UnifiedLiquidationSerieDataPointDTO } from '../performance-series.model'
import {
  ChartDataSerie,
  ChartGeneratedData,
  Timeframe,
  ValueType,
  WalletsTimeframeGroupValue,
} from './group-series.model'

@Injectable()
export class GroupSeriesService {
  /**
   * FUNCTIONS
   */

  /**
   * Generate Chart data and options for the `Unified Wallets Grouped Summed data`.
   *
   * - It will show calculated data in Currency or Percentage values based on the `valueType` parameter.
   * - It groups data into `months`, `quarters` and `years` based on the `timeframe` parameter. (`Months` will be reduced to only the last 12 ones, avoiding showing too much data)
   * - It shows only `Net` or `Input, Gross and Net` results based on the `compareNetOnly` parameter.
   *
   * `Input Value` WILL NOT be shown if `Percentage` data is selected, since it would be illogical and always show 100%.
   *
   * @param dataSerie: Will be the unified array of assets pre desc ordered by `date`.
   * @param timeframe: The selected timeframe to group data points by (month, quarter or year).
   * @param valueType: Whether to show values in `Currency` or `Percentage` format.
   * @param compareNetOnly: Whether to show only `Net` results or compare `Input, Gross and Net` results.
   * @param chartXLimits: Optional parameter to limit the number of entries shown in the chart's X axis, for screen size purposes (e.g. last 4 groups only if screen is small).
   * @returns The generated chart data and options config based on the given parameters.
   */
  chartDataUnifiedWallets(
    dataSerie: UnifiedLiquidationSerieDataPointDTO[],
    timeframe: Timeframe,
    valueType: ValueType,
    compareNetOnly: boolean,
    chartXLimits?: number
  ): ChartGeneratedData {
    if (dataSerie.length === 0) return {} as ChartGeneratedData

    let timeframeGroupMap = new Map<
      string,
      {
        label: string
        timeSignature: number
        inputValue: Big
        grossAmount: Big
        netAmount: Big
      }
    >()

    for (const dataPoint of dataSerie) {
      let {
        key: groupKey,
        label: groupLabel,
        timeSignature,
      } = this._generateTimeframeKey(dataPoint.dateUtc, timeframe)

      if (!timeframeGroupMap.has(groupKey)) {
        timeframeGroupMap.set(groupKey, {
          label: groupLabel,
          timeSignature,
          inputValue: new Big(0),
          grossAmount: new Big(0),
          netAmount: new Big(0),
        })
      }

      let timeframeGroupData = timeframeGroupMap.get(groupKey)!

      if (valueType === ValueType.Percentage) {
        timeframeGroupData.grossAmount = timeframeGroupData.grossAmount.add(
          new Big(dataPoint.grossAmount).div(dataPoint.inputAmount)
        )
        timeframeGroupData.netAmount = timeframeGroupData.netAmount.add(
          new Big(dataPoint.netAmount).div(dataPoint.inputAmount)
        )
      } else {
        timeframeGroupData.inputValue = timeframeGroupData.inputValue.add(dataPoint.inputAmount)
        timeframeGroupData.grossAmount = timeframeGroupData.grossAmount.add(dataPoint.grossAmount)
        timeframeGroupData.netAmount = timeframeGroupData.netAmount.add(dataPoint.netAmount)
      }

      timeframeGroupMap.set(groupKey, timeframeGroupData)
    }

    let limitedTimeframeGroup = Array.from(timeframeGroupMap.values()).sort(
      (a, b) => b.timeSignature - a.timeSignature
    )
    if (chartXLimits !== undefined) {
      limitedTimeframeGroup = limitedTimeframeGroup.slice(0, chartXLimits)
    }

    if (!compareNetOnly) {
      const chartInputName = 'Summed Input'
      const chartGrossName = 'Summed Gross'
      const chartNetName = 'Summed Net'
      let inputGroup: ChartDataSerie = [chartInputName]
      let grossGroup: ChartDataSerie = [chartGrossName]
      let netGroup: ChartDataSerie = [chartNetName]
      let xAxis: ChartDataSerie = ['x']

      for (let groupedData of limitedTimeframeGroup) {
        if (valueType === ValueType.Currency) {
          inputGroup.push(groupedData.inputValue.round(2, Big.roundHalfUp).toNumber())
        }
        grossGroup.push(groupedData.grossAmount.round(2, Big.roundHalfUp).toNumber())
        netGroup.push(groupedData.netAmount.round(2, Big.roundHalfUp).toNumber())
        xAxis.push(groupedData.label)
      }

      return {
        data: {
          x: 'x',
          columns: [xAxis, inputGroup, grossGroup, netGroup],
          types: {
            [chartInputName]: bar(),
            [chartGrossName]: bar(),
            [chartNetName]: bar(),
          },
        },
      }
    } else {
      const chartNetName = 'Summed Net'
      let netGroup: ChartDataSerie = [chartNetName]
      let xAxis: ChartDataSerie = ['x']

      for (let groupedData of limitedTimeframeGroup) {
        netGroup.push(groupedData.netAmount.round(2, Big.roundHalfUp).toNumber())
        xAxis.push(groupedData.label)
      }

      return {
        data: {
          x: 'x',
          columns: [xAxis, netGroup],
          types: {
            [chartNetName]: bar(),
          },
        },
      }
    }
  }

  /**
   * Generate Chart data and options for the `Separated Wallets Grouped Summed data`.
   *
   * - It will show calculated data in Currency or Percentage values based on the `valueType` parameter.
   * - It groups data into `months`, `quarters` and `years` based on the `timeframe` parameter. (`Months` will be reduced to only the last 12 ones, avoiding showing too much data)
   * - It shows only `Net` or `Input, Gross and Net` results based on the `compareNetOnly` parameter.
   *
   * `Input Value` WILL NOT be shown if `Percentage` data is selected, since it would be illogical and always show 100%.
   *
   * @param dataSerie: Will be the array of assets pre desc ordered by `date`.
   * @param timeframe: The selected timeframe to group data points by (month, quarter or year).
   * @param valueType: Whether to show values in `Currency` or `Percentage` format.
   * @param compareNetOnly: Whether to show only `Net` results or compare `Input, Gross and Net` results.
   * @param chartXLimits: Optional parameter to limit the number of entries shown in the chart's X axis, for screen size purposes (e.g. last 4 groups only if screen is small).
   * @returns The generated chart data and options config based on the given parameters.
   */
  chartDataSeparatedWallets(
    dataSeries: LiquidationSerieDTO[],
    timeframe: Timeframe,
    valueType: ValueType,
    compareNetOnly: boolean,
    chartXLimits?: number
  ): ChartGeneratedData {
    if (dataSeries.length === 0) return {} as ChartGeneratedData

    let walletsTimeframeGroupMap = new Map<string, WalletsTimeframeGroupValue>()

    // Get only wallets with data
    let walletsWithData = dataSeries
      .filter(wallet => wallet.dataPoints.length > 0)
      .map(wallet => ({
        id: wallet.walletId,
        name: wallet.walletName,
      }))

    for (const wallet of dataSeries) {
      if (wallet.dataPoints.length === 0) continue

      for (const dataPoint of wallet.dataPoints) {
        let {
          key: timeframeKey,
          label: timeframeLabel,
          timeSignature,
        } = this._generateTimeframeKey(dataPoint.dateUtc, timeframe)

        if (!walletsTimeframeGroupMap.has(timeframeKey)) {
          // Force create the same timeframeKeys in all of the Wallets series, so they all have the same X axis values, even if some of them don't have data for some timeframes
          let walletsData: WalletsTimeframeGroupValue = {
            timeSignature,
            timeframeLabel,
            wallets: {},
          }

          for (const walletWithData of walletsWithData) {
            walletsData.wallets[walletWithData.id] = {
              walletName: walletWithData.name,
              inputValue: null,
              grossAmount: null,
              netAmount: null,
            }
          }
          walletsTimeframeGroupMap.set(timeframeKey, walletsData)
        }

        let walletsTimeframeGroupData = walletsTimeframeGroupMap.get(timeframeKey)
        if (!walletsTimeframeGroupData) continue

        if (walletsTimeframeGroupData.wallets[wallet.walletId].inputValue === null) {
          walletsTimeframeGroupData.wallets[wallet.walletId].inputValue = new Big(0)
        }
        if (walletsTimeframeGroupData.wallets[wallet.walletId].grossAmount === null) {
          walletsTimeframeGroupData.wallets[wallet.walletId].grossAmount = new Big(0)
        }
        if (walletsTimeframeGroupData.wallets[wallet.walletId].netAmount === null) {
          walletsTimeframeGroupData.wallets[wallet.walletId].netAmount = new Big(0)
        }

        if (valueType === ValueType.Percentage) {
          walletsTimeframeGroupData.wallets[wallet.walletId].grossAmount =
            walletsTimeframeGroupData.wallets[wallet.walletId].grossAmount!.add(
              new Big(dataPoint.grossAmount).div(dataPoint.inputAmount)
            )
          walletsTimeframeGroupData.wallets[wallet.walletId].netAmount =
            walletsTimeframeGroupData.wallets[wallet.walletId].netAmount!.add(
              new Big(dataPoint.netAmount).div(dataPoint.inputAmount)
            )
        } else {
          walletsTimeframeGroupData.wallets[wallet.walletId].inputValue =
            walletsTimeframeGroupData.wallets[wallet.walletId].inputValue!.add(
              dataPoint.inputAmount
            )
          walletsTimeframeGroupData.wallets[wallet.walletId].grossAmount =
            walletsTimeframeGroupData.wallets[wallet.walletId].grossAmount!.add(
              dataPoint.grossAmount
            )
          walletsTimeframeGroupData.wallets[wallet.walletId].netAmount =
            walletsTimeframeGroupData.wallets[wallet.walletId].netAmount!.add(dataPoint.netAmount)
        }

        walletsTimeframeGroupMap.set(timeframeKey, walletsTimeframeGroupData)
      }
    }

    let limitedWalletsTimeframeGroup: WalletsTimeframeGroupValue[] = Array.from(
      walletsTimeframeGroupMap.values()
    ).sort(
      (a: WalletsTimeframeGroupValue, b: WalletsTimeframeGroupValue) =>
        b.timeSignature - a.timeSignature
    )
    if (chartXLimits !== undefined) {
      limitedWalletsTimeframeGroup = limitedWalletsTimeframeGroup.slice(0, chartXLimits)
    }

    let skipInputValues = valueType === ValueType.Percentage
    let dataColumnsMap = new Map<
      string,
      { input?: ChartDataSerie; gross?: ChartDataSerie; net: ChartDataSerie }
    >()
    let xAxis: ChartDataSerie = ['x']
    let dataGroups: string[][] = []

    // Initialize the dataColumns with the series names
    walletsWithData.forEach(wallet => {
      dataColumnsMap.set(wallet.id, {
        net: [`Net ${wallet.name}`],
        ...(!compareNetOnly && !skipInputValues ? { input: [`Input ${wallet.name}`] } : {}),
        ...(!compareNetOnly ? { gross: [`Gross ${wallet.name}`] } : {}),
      })
    })

    // Create data groups for the Chart, FIXME: WHAT WILL THIS DO
    if (!compareNetOnly) {
      if (!skipInputValues) dataGroups.push(walletsWithData.map(wallet => `Input ${wallet.name}`))
      dataGroups.push(walletsWithData.map(wallet => `Gross ${wallet.name}`))
    }
    dataGroups.push(walletsWithData.map(wallet => `Net ${wallet.name}`))

    for (const walletsGroupedData of limitedWalletsTimeframeGroup) {
      if (xAxis.at(-1) !== walletsGroupedData.timeframeLabel)
        xAxis.push(walletsGroupedData.timeframeLabel)

      for (const [walletId, groupedData] of Object.entries(walletsGroupedData.wallets)) {
        let dataColumnsMapValue = dataColumnsMap.get(walletId)!

        if (dataColumnsMapValue.input !== undefined) {
          dataColumnsMapValue.input.push(
            groupedData.inputValue
              ? groupedData.inputValue.round(2, Big.roundHalfUp).toNumber()
              : null
          )
        }
        if (dataColumnsMapValue.gross !== undefined) {
          dataColumnsMapValue.gross.push(
            groupedData.grossAmount
              ? groupedData.grossAmount.round(2, Big.roundHalfUp).toNumber()
              : null
          )
        }
        dataColumnsMapValue.net.push(
          groupedData.netAmount ? groupedData.netAmount.round(2, Big.roundHalfUp).toNumber() : null
        )

        dataColumnsMap.set(walletId, dataColumnsMapValue)
      }
    }

    let dataColumns: ChartDataSerie[] = []
    dataColumnsMap.forEach(value => {
      if (value.input) dataColumns.push(value.input)
      if (value.gross) dataColumns.push(value.gross)
      dataColumns.push(value.net)
    })
    dataColumns.push([...xAxis])

    return {
      data: {
        x: 'x',
        columns: dataColumns,
        type: bar(),
        groups: cloneDeep(dataGroups),
      },
    }
  }

  /**
   * Generate a key to group data points by the selected timeframe (month, quarter or year).
   *
   * @param epochMS: The date in milliseconds to generate the key from.
   * @param timeframe: The selected timeframe to generate the key for.
   * @returns An object containing the generated key, label and time signature for the given date and timeframe.
   * @throws Error if an invalid timeframe is provided.
   */
  private _generateTimeframeKey(
    epochMS: number,
    timeframe: Timeframe
  ): {
    key: string
    label: string
    timeSignature: number
  } {
    const date = DateTime.fromMillis(epochMS)
    switch (timeframe) {
      case Timeframe.Month:
        return {
          key: `${date.year}-${date.month.toString().padStart(2, '0')}`,
          label: formatDate(date.toJSDate(), 'MMM yy', 'en_US'),
          // Use 15th of the month to avoid timezone issues and ensure all dates in the same month have the same timeSignature
          timeSignature: DateTime.fromObject({
            year: date.year,
            month: date.month,
            day: 15,
          }).toMillis(),
        }
      case Timeframe.Quarter:
        return {
          key: `${date.year}-Q${date.quarter}`,
          label: `${date.year} Q${date.quarter}`,
          // Use 15th of the first month of the quarter to avoid timezone issues and ensure all dates in the same quarter have the same timeSignature
          timeSignature: DateTime.fromObject({
            year: date.year,
            month: (date.quarter - 1) * 3 + 1,
            day: 15,
          }).toMillis(),
        }
      case Timeframe.Year:
        return {
          key: `${date.year}`,
          label: `${date.year}`,
          // Use 15th of January to avoid timezone issues and ensure all dates in the same year have the same timeSignature
          timeSignature: DateTime.fromObject({ year: date.year, month: 1, day: 15 }).toMillis(),
        }
      default:
        throw new Error('Invalid timeframe')
    }
  }
}
