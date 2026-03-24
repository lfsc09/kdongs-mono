import Big from 'big.js'
import { DateTime } from 'luxon'

export interface BasePerformance {
  id: string
  name: string
  isDone: boolean
  startDateUtc: DateTime | null
  // Date of the latest relevant transaction for the asset, which can be the ('enter date', 'last transaction date' or 'exit date')
  latestDateUtc: DateTime | null
  inputAmount: Big
  grossAmount: Big
  costs: Big
  taxes: Big
  netAmount: Big
  daysRunning: number
}

/**
 * Sort function to order assets by latest date.
 *
 * @param a - The first asset to compare
 * @param b - The second asset to compare
 * @param order - The order to sort by, either 'asc' for ascending or 'desc' for descending
 * @returns A negative number if `a` should be ordered before `b`, a positive number if `a` should be ordered after `b`, or 0 if they are equal in terms of ordering
 */
export function basePerformanceSorter(
  a: BasePerformance,
  b: BasePerformance,
  order: 'asc' | 'desc',
): number {
  const dateA = a.latestDateUtc ? a.latestDateUtc.toMillis() : 0
  const dateB = b.latestDateUtc ? b.latestDateUtc.toMillis() : 0

  if (order === 'asc') {
    return dateA - dateB
  } else {
    return dateB - dateA
  }
}

/**
 * Discover the trend of the wallet based on the performance of its assets.
 *
 * The trend is calculated by first aggregating the net amounts of the assets by their latest date, then calculating a moving average to smooth the trend, and finally comparing the values to determine if the trend is up, down or stable. If there are not enough valid values to calculate the trend, it returns 'unknown'.
 *
 * @param prBonds - The performance of the private bonds in the wallet
 * @param puBonds - The performance of the public bonds in the wallet
 * @param sefbfrAssets - The performance of the SEFBFR assets in the wallet
 * @param depth - The number of average values in constructing the trend (less significant compared to `smoothAvg`)
 * @param smoothAvg - The number of values to average for smoothing the trend (more significant compared to `depth`)
 * @returns The trend of the wallet, which can be 'up', 'down', 'stable' or 'unknown'
 */
export function discoverTrend(
  prBonds: BasePerformance[],
  puBonds: BasePerformance[],
  sefbfrAssets: BasePerformance[],
  depth: number = 2,
  smoothAvg: number = 2,
): 'up' | 'down' | 'stable' | 'unknown' {
  const trendMap = new Map<string, Big>()
  const minAmountOfValues = depth + smoothAvg - 1

  if (depth < 2) {
    throw new Error('Depth must be at least 2 to discover a trend')
  }
  if (smoothAvg < 1) {
    throw new Error('Average must be at least 1 to discover a trend')
  }

  // For private bonds, only consider done assets to have valid netAmount values
  for (let i = prBonds.length - 1, validValues = 0; i >= 0; i--) {
    if (validValues >= minAmountOfValues) break
    if (prBonds[i].latestDateUtc !== null && prBonds[i].isDone) {
      const key = prBonds[i].latestDateUtc!.toISODate()!
      if (trendMap.has(key)) {
        const existingValue = trendMap.get(key)!
        trendMap.set(key, existingValue.add(prBonds[i].netAmount))
      } else {
        trendMap.set(key, prBonds[i].netAmount)
      }
      validValues++
    }
  }

  for (let i = puBonds.length - 1, validValues = 0; i >= 0; i--) {
    if (validValues >= minAmountOfValues) break
    if (puBonds[i].latestDateUtc !== null) {
      const key = puBonds[i].latestDateUtc!.toISODate()!
      if (trendMap.has(key)) {
        const existingValue = trendMap.get(key)!
        trendMap.set(key, existingValue.add(puBonds[i].netAmount))
      } else {
        trendMap.set(key, puBonds[i].netAmount)
      }
      validValues++
    }
  }

  for (let i = sefbfrAssets.length - 1, validValues = 0; i >= 0; i--) {
    if (validValues >= minAmountOfValues) break
    if (sefbfrAssets[i].latestDateUtc !== null) {
      const key = sefbfrAssets[i].latestDateUtc!.toISODate()!
      if (trendMap.has(key)) {
        const existingValue = trendMap.get(key)!
        trendMap.set(key, existingValue.add(sefbfrAssets[i].netAmount))
      } else {
        trendMap.set(key, sefbfrAssets[i].netAmount)
      }
      validValues++
    }
  }

  // Ascending sort the dates
  const sortedDates = Array.from(trendMap.keys()).sort((a, b) => {
    const dateA = new Date(a).getTime()
    const dateB = new Date(b).getTime()
    return dateA - dateB
  })

  // Check if we have enough valid values to calculate the trend
  if (sortedDates.length < minAmountOfValues) {
    return 'unknown'
  }

  // Calculate moving average to smooth the trend
  let trendAvgValues = []
  for (let i = 0; i <= sortedDates.length - smoothAvg; i++) {
    let sum = new Big(0)
    for (let j = 0; j < smoothAvg; j++) {
      sum = sum.add(trendMap.get(sortedDates[i + j])!)
    }
    trendAvgValues.push(sum.div(smoothAvg))
  }

  // Limit to the latest `depth` amount of values
  trendAvgValues = trendAvgValues.slice(-depth)

  let trend: 'up' | 'down' | 'stable' | 'unknown' = 'unknown'
  let currentTrendValue: Big | undefined
  let previousTrendValue: Big | undefined

  for (const avgNetAmount of trendAvgValues) {
    if (currentTrendValue === undefined) {
      currentTrendValue = avgNetAmount
    } else {
      previousTrendValue = currentTrendValue
      currentTrendValue = currentTrendValue.add(avgNetAmount)
    }

    if (currentTrendValue !== undefined && previousTrendValue !== undefined) {
      if (currentTrendValue.gt(previousTrendValue)) {
        trend = 'up'
      } else if (currentTrendValue.lt(previousTrendValue)) {
        trend = 'down'
      } else {
        trend = 'stable'
      }
    }
  }

  return trend
}
