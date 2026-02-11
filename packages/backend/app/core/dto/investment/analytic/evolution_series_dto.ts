import { InferInput } from '@vinejs/vine/types'
import { evolutionSeriesAnalyticsSchema } from '#validators/investment/analytic/evolution_series'

export type EvolutionSeriesAnalyticsRequest = InferInput<typeof evolutionSeriesAnalyticsSchema> & {
  // Manually override the type of useLivePriceQuote to be a boolean, since vine boolean by default does not give only boolean and the validator transforms it to a boolean
  useLivePriceQuote: boolean
}

type SerieType = 'movement' | 'brl_private_bond' | 'brl_public_bond' | 'sefbfr'

export type EvolutionSeriesAnalyticsResponse = {
  data: {
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
