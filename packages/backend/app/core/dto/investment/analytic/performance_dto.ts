import type { InferInput } from '@vinejs/vine/types'
import type { performanceAnalyticsSchema } from '#validators/investment/analytic/performance'

export type PerformanceAnalayticsRequest = InferInput<typeof performanceAnalyticsSchema> & {
  // Manually override the type of useLivePriceQuote to be a boolean, since vine boolean by default does not give only boolean and the validator transforms it to a boolean
  useLivePriceQuote: boolean
}

export type PerformanceAnalyticsResponse = {
  data: {
    currencyToShow: string
    walletIds: string[]
    indicators: {
      resultingBalanceInCurrency: number
      resultingProfitInCurrency: number
      resultingProfitInPerc: number | undefined
      dateStartUtc: string | undefined
      dateEndUtc: string | undefined
      assetDateStartUtc: string | undefined
      assetDateEndUtc: string | undefined
      movementDateStartUtc: string | undefined
      movementDateEndUtc: string | undefined
      avgDaysByAsset: number | undefined
      numberOfMovements: number
      numberOfMovementsDeposit: number
      numberOfMovementsWithdrawal: number
      numberOfAssets: number
      numberOfAssetsProfit: number
      numberOfAssetsLoss: number
      numberOfActiveAssets: number
      numberOfActiveAssetsProfit: number
      numberOfActiveAssetsLoss: number
      expectancyByAsset: number | undefined
      expectancyByDay: number | undefined
      expectancyByMonth: number | undefined
      expectancyByQuarter: number | undefined
      expectancyByYear: number | undefined
      avgCostByAsset: number | undefined
      avgCostByDay: number | undefined
      avgCostByMonth: number | undefined
      avgCostByQuarter: number | undefined
      avgCostByYear: number | undefined
      avgTaxByAsset: number | undefined
      avgTaxByDay: number | undefined
      avgTaxByMonth: number | undefined
      avgTaxByQuarter: number | undefined
      avgTaxByYear: number | undefined
      movementsSum: number
      movementsAvg: number | undefined
      movementsMax: number | undefined
      movementsMin: number | undefined
      netProfitSum: number
      netProfitAvg: number | undefined
      netProfitMax: number | undefined
      netLossSum: number
      netLossAvg: number | undefined
      netLossMax: number | undefined
      breakeven: number | undefined
      edge: number | undefined
      historyHigh: number | undefined
      historyLow: number | undefined
    }
  }
}
