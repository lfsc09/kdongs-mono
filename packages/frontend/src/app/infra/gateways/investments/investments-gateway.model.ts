import z from 'zod'
import {
  CurrencySchema,
  SelectableCurrencySchema,
} from '../../../pages/private/modules/investments/investments.model'
import {
  PaginationRequestSchema,
  PaginationResponseSchema,
  SortOrderSchema,
} from '../shared/default-gateway.model'

/**
 * List User Wallet DTOs
 */
export const ListUserWalletDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  currencyCode: z.string(),
  trend: z.enum(['up', 'down', 'stable', 'unknown']),
  initialBalance: z.number(),
  currentBalance: z.number(),
  profitInCurrency: z.number(),
  profitInPerc: z.number(),
  createdAt: z.string(),
  updatedAt: z.optional(z.string()),
})
export const ListUserWalletRequestDTOSchema = z.object({
  sortBy: z.optional(
    z.enum(['walletName', 'walletCurrencyCode', 'walletCreatedAt', 'walletUpdatedAt'])
  ),
  sortOrder: z.optional(SortOrderSchema),
  ...PaginationRequestSchema.shape,
})
export const ListUserWalletResponseDTOSchema = z.object({
  data: z.object({
    wallets: z.array(ListUserWalletDTOSchema),
  }),
  metadata: PaginationResponseSchema,
})

export type ListUserWalletDTO = z.infer<typeof ListUserWalletDTOSchema>
export type ListUserWalletRequestDTO = z.infer<typeof ListUserWalletRequestDTOSchema>
export type ListUserWalletResponseDTO = z.infer<typeof ListUserWalletResponseDTOSchema>

/**
 * Get Performance Analytics DTO
 */
export const PerformanceAnalyticsIndicatorsDTOSchema = z.object({
  resultingBalanceInCurrency: z.number(),
  resultingProfitInCurrency: z.number(),
  resultingProfitInPerc: z.number().optional(),
  dateStartUtc: z.string().optional(),
  dateEndUtc: z.string().optional(),
  assetDateStartUtc: z.string().optional(),
  assetDateEndUtc: z.string().optional(),
  movementDateStartUtc: z.string().optional(),
  movementDateEndUtc: z.string().optional(),
  avgDaysByAsset: z.number().optional(),
  numberOfMovements: z.number(),
  numberOfMovementsDeposit: z.number(),
  numberOfMovementsWithdrawal: z.number(),
  numberOfAssets: z.number(),
  numberOfAssetsProfit: z.number(),
  numberOfAssetsLoss: z.number(),
  numberOfActiveAssets: z.number(),
  numberOfActiveAssetsProfit: z.number(),
  numberOfActiveAssetsLoss: z.number(),
  expectancyByAsset: z.number().optional(),
  expectancyByDay: z.number().optional(),
  expectancyByMonth: z.number().optional(),
  expectancyByQuarter: z.number().optional(),
  expectancyByYear: z.number().optional(),
  avgCostByAsset: z.number().optional(),
  avgCostByDay: z.number().optional(),
  avgCostByMonth: z.number().optional(),
  avgCostByQuarter: z.number().optional(),
  avgCostByYear: z.number().optional(),
  avgTaxByAsset: z.number().optional(),
  avgTaxByDay: z.number().optional(),
  avgTaxByMonth: z.number().optional(),
  avgTaxByQuarter: z.number().optional(),
  avgTaxByYear: z.number().optional(),
  movementsSum: z.number(),
  movementsAvg: z.number().optional(),
  movementsMax: z.number().optional(),
  movementsMin: z.number().optional(),
  netProfitSum: z.number(),
  netProfitAvg: z.number().optional(),
  netProfitMax: z.number().optional(),
  netLossSum: z.number(),
  netLossAvg: z.number().optional(),
  netLossMax: z.number().optional(),
  breakeven: z.number().optional(),
  edge: z.number().optional(),
  historyHigh: z.number().optional(),
  historyLow: z.number().optional(),
})
export const GetPerformanceAnalyticsRequestDTOSchema = z.object({
  useLivePriceQuote: z.boolean(),
  walletIds: z.array(z.string()).optional(),
  selectedCurrency: SelectableCurrencySchema,
})
export const GetPerformanceAnalyticsResponseDTOSchema = z.object({
  data: z.object({
    currencyToShow: z.string(),
    walletIds: z.array(z.string()),
    indicators: PerformanceAnalyticsIndicatorsDTOSchema,
  }),
})

export type PerformanceAnalyticsIndicatorsDTO = z.infer<
  typeof PerformanceAnalyticsIndicatorsDTOSchema
>
export type GetPerformanceAnalyticsRequestDTO = z.infer<
  typeof GetPerformanceAnalyticsRequestDTOSchema
>
export type GetPerformanceAnalyticsResponseDTO = z.infer<
  typeof GetPerformanceAnalyticsResponseDTOSchema
>

/**
 * Get Liquidation Series Analytics DTO
 */
export const LiquidationSerieDataPointDTOSchema = z.object({
  type: z.enum(['movement', 'brl_private_bond', 'brl_public_bond', 'sefbfr']),
  dateUtc: z.number(),
  inputAmount: z.number(),
  grossAmount: z.number(),
  netAmount: z.number(),
  costsAndTaxes: z.number(),
})
export const LiquidationSerieDTOSchema = z.object({
  walletId: z.string(),
  walletName: z.string(),
  dataPoints: z.array(LiquidationSerieDataPointDTOSchema),
})
export const GetLiquidationSeriesAnalyticsRequestDTOSchema = z.object({
  useLivePriceQuote: z.boolean(),
  walletIds: z.array(z.string()).optional(),
  selectedCurrency: CurrencySchema,
})
export const GetLiquidationSeriesAnalyticsResponseDTOSchema = z.object({
  data: z.array(LiquidationSerieDTOSchema),
})

export type LiquidationSerieDataPointDTO = z.infer<typeof LiquidationSerieDataPointDTOSchema>
export type LiquidationSerieDTO = z.infer<typeof LiquidationSerieDTOSchema>
export type GetLiquidationSeriesAnalyticsRequestDTO = z.infer<
  typeof GetLiquidationSeriesAnalyticsRequestDTOSchema
>
export type GetLiquidationSeriesAnalyticsResponseDTO = z.infer<
  typeof GetLiquidationSeriesAnalyticsResponseDTOSchema
>
