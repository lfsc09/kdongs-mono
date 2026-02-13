import { InferInput } from '@vinejs/vine/types'
import { liquidationSeriesAnalyticsSchema } from '#validators/investment/analytic/liquidation_series'

export type LiquidationSeriesAnalyticsRequest = InferInput<
  typeof liquidationSeriesAnalyticsSchema
> & {
  // Manually override the type of useLivePriceQuote to be a boolean, since vine boolean by default does not give only boolean and the validator transforms it to a boolean
  useLivePriceQuote: boolean
}

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
}
export type AnalyticSerie = {
  walletId: string
  walletName: string
  dataPoints: AnalyticSerieDataPoint[]
}

export type LiquidationSeriesAnalyticsResponse = {
  data: AnalyticSerie[]
}
