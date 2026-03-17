export type AnalyticSerieDataPointType =
  | 'movement'
  | 'brl_private_bond'
  | 'brl_public_bond'
  | 'sefbfr'

export type AnalyticSerieDataPoint = {
  type: AnalyticSerieDataPointType
  dateUtc: number
  inputAmount: number
  grossAmount: number
  netAmount: number
  costsAndTaxes: number
  daysRunning: number
}

export type AnalyticSerie = {
  walletId: string
  walletName: string
  dataPoints: AnalyticSerieDataPoint[]
}

export type LiquidationSeriesAnalyticsRequest = {
  selectedCurrency: string
  useLivePriceQuote?: boolean
  userId: string
  walletIds?: string[] | string
}

export type LiquidationSeriesAnalyticsResponse = AnalyticSerie[]
