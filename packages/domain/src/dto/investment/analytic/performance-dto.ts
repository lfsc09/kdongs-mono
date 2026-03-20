export type PerformanceAnalayticsRequest = {
  selectedCurrency: string
  useLivePriceQuote?: boolean
  walletIds?: string[] | string
}

export type PerformanceAnalyticsResponse = {
  currencyToShow: string
  walletIds: string[]
  indicators: {
    resultingBalanceInCurrency: number
    resultingProfitInCurrency: number
    resultingProfitInPerc?: number
    dateStartUtc?: string
    dateEndUtc?: string
    assetDateStartUtc?: string
    assetDateEndUtc?: string
    movementDateStartUtc?: string
    movementDateEndUtc?: string
    avgDaysByAsset?: number
    numberOfMovements: number
    numberOfMovementsDeposit: number
    numberOfMovementsWithdrawal: number
    numberOfAssets: number
    numberOfAssetsProfit: number
    numberOfAssetsLoss: number
    numberOfActiveAssets: number
    numberOfActiveAssetsProfit: number
    numberOfActiveAssetsLoss: number
    expectancyByAsset?: number
    expectancyByDay?: number
    expectancyByMonth?: number
    expectancyByQuarter?: number
    expectancyByYear?: number
    avgCostByAsset?: number
    avgCostByDay?: number
    avgCostByMonth?: number
    avgCostByQuarter?: number
    avgCostByYear?: number
    avgTaxByAsset?: number
    avgTaxByDay?: number
    avgTaxByMonth?: number
    avgTaxByQuarter?: number
    avgTaxByYear?: number
    sumCosts: number
    sumTaxes: number
    movementsSum: number
    movementsAvg?: number
    movementsMax?: number
    movementsMin?: number
    netProfitSum: number
    netProfitAvg?: number
    netProfitMax?: number
    netProfitMin?: number
    netLossSum: number
    netLossAvg?: number
    netLossMax?: number
    netLossMin?: number
    breakeven?: number
    edge?: number
    historyHighestBalance?: number
    historyLowestBalance?: number
    historyHighestNet?: number
    historyLowestNet?: number
  }
}
