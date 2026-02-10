import type { InferInput } from '@vinejs/vine/types'
import type { handleSelectedWalletsPerformanceSchema } from '#validators/investment/wallet_performance/handle'

export type HandleSelectedWalletsPerformanceRequest = InferInput<
  typeof handleSelectedWalletsPerformanceSchema
> & {
  // Manually override the type of useLivePriceQuote to be a boolean, since vine boolean by default does not give only boolean and the validator transforms it to a boolean
  useLivePriceQuote: boolean
}

export type HandleSelectedWalletsPerformanceResponse = {
  data: {
    currencyToShow: string
    walletIds: string[]
    indicators: {
      resultingBalanceInCurrency: number
      resultingProfitInCurrency: number
      resultingProfitInPerc: number
      dateStartUtc: string
      dateEndUtc: string
      avgDaysByAsset: number
      numberOfMovements: number
      numberOfMovementsDeposit: number
      numberOfMovementsWithdrawal: number
      numberOfAssets: number
      numberOfAssetsProfit: number
      numberOfAssetsLoss: number
      numberOfActiveAssets: number
      numberOfActiveAssetsProfit: number
      numberOfActiveAssetsLoss: number
      expectancyByAsset: number
      expectancyByDay: number
      expectancyByMonth: number
      expectancyByQuarter: number
      expectancyByYear: number
      avgCostByAsset: number
      avgCostByDay: number
      avgCostByMonth: number
      avgCostByQuarter: number
      avgCostByYear: number
      avgTaxByAsset: number
      avgTaxByDay: number
      avgTaxByMonth: number
      avgTaxByQuarter: number
      avgTaxByYear: number
      breakeven: number
      edge: number
      profitSum: number
      profitAvg: number
      profitMax: number
      lossSum: number
      lossAvg: number
      lossMax: number
      historyHigh: number
      historyLow: number
    }
    series: {
      walletId: string
      walletName: string
      dataPoints: {
        type: SerieType
        doneDateUtc: number
        inputAmount: number
        grossAmount: number
        netAmount: number
        feesAndCosts: number
        daysRunning: number
      }[]
    }[]
  }
}

export type SerieType = 'movement' | 'brl_private_bond' | 'brl_public_bond' | 'sefbfr'
