import z from 'zod'
import { CurrencySchema } from '../../../pages/private/modules/investments/investments.model'
import { SelectableCurrencySchema } from '../../../pages/private/modules/investments/performance/performance.model'
import {
  AdonisJSErrorSchema,
  PaginationRequestSchema,
  PaginationResponseSchema,
  SortOrderSchema,
} from '../shared/default-gateway.model'

/**
 * WALLETS
 *
 */

/**
 * List User Wallet DTOs
 */
export const ListUserWalletDTOSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
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
  sumCosts: z.number(),
  sumTaxes: z.number(),
  movementsSum: z.number(),
  movementsAvg: z.number().optional(),
  movementsMax: z.number().optional(),
  movementsMin: z.number().optional(),
  netProfitSum: z.number(),
  netProfitAvg: z.number().optional(),
  netProfitMax: z.number().optional(),
  netProfitMin: z.number().optional(),
  netLossSum: z.number(),
  netLossAvg: z.number().optional(),
  netLossMax: z.number().optional(),
  netLossMin: z.number().optional(),
  breakeven: z.number().optional(),
  edge: z.number().optional(),
  historyHighestBalance: z.number().optional(),
  historyLowestBalance: z.number().optional(),
  historyHighestNet: z.number().optional(),
  historyLowestNet: z.number().optional(),
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
  daysRunning: z.number(),
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

/**
 * Create User Wallet DTOs (Form data only)
 */
export const CreateWalletDTOSchema = z.object({
  currencyCodes: z.array(z.string()),
})
export const CreateWalletResponseSchema = z.object({
  data: CreateWalletDTOSchema,
})

export type CreateWalletDTO = z.infer<typeof CreateWalletDTOSchema>
export type CreateWalletResponse = z.infer<typeof CreateWalletResponseSchema>

/**
 * Edit User Wallet DTOs (Form data only)
 */
export const EditWalletDTOSchema = z.object({
  wallet: z.object({
    name: z.string(),
    currencyCode: z.string(),
  }),
  currencyCodes: z.array(z.string()),
})
export const EditWalletRequestSchema = z.object({
  walletId: z.string(),
})
export const EditWalletResponseSchema = z.object({
  data: EditWalletDTOSchema,
})

export type EditWalletDTO = z.infer<typeof EditWalletDTOSchema>
export type EditWalletRequest = z.infer<typeof EditWalletRequestSchema>
export type EditWalletResponse = z.infer<typeof EditWalletResponseSchema>

/**
 * Store User Wallet DTOs
 */
export const StoreWalletRequestSchema = z.object({
  name: z.optional(z.string()),
  currencyCode: z.optional(z.string()),
})
export const StoreWalletResponseSchema = z.object({
  errors: z.optional(AdonisJSErrorSchema.def.shape.errors),
})

export type StoreWalletRequest = z.infer<typeof StoreWalletRequestSchema>
export type StoreWalletResponse = z.infer<typeof StoreWalletResponseSchema>

/**
 * Update User Wallet DTOs
 */
export const UpdateWalletRequestSchema = z.object({
  walletId: z.string(),
  name: z.optional(z.string()),
  currencyCode: z.optional(z.string()),
})
export const UpdateWalletResponseSchema = z.object({
  errors: z.optional(AdonisJSErrorSchema.def.shape.errors),
})

export type UpdateWalletRequest = z.infer<typeof UpdateWalletRequestSchema>
export type UpdateWalletResponse = z.infer<typeof UpdateWalletResponseSchema>

/**
 * WALLET MOVEMENTS
 *
 */

/**
 * List User Wallet Movements DTOs
 */
export const ListUserWalletMovementDTOSchema = z.object({
  id: z.string(),
  movementType: z.string(),
  hasConversion: z.boolean(),
  dateUtc: z.string().optional(),
  originCurrencyCode: z.string(),
  originAmount: z.number(),
  originExchGrossRate: z.number().optional(),
  originExchOpFee: z.number().optional(),
  originExchVetRate: z.number().optional(),
  resultCurrencyCode: z.string(),
  resultAmount: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export const ListUserWalletMovementsRequestDTOSchema = z.object({
  walletId: z.string(),
  sortBy: z.optional(
    z.enum(['movementId', 'movementOriginAmount', 'movementResultAmount', 'movementDateUtc'])
  ),
  sortOrder: z.optional(SortOrderSchema),
  ...PaginationRequestSchema.shape,
})
export const ListUserWalletMovementsResponseDTOSchema = z.object({
  data: z.object({
    movements: z.array(ListUserWalletMovementDTOSchema),
  }),
  metadata: PaginationResponseSchema,
})

export type ListUserWalletMovementDTO = z.infer<typeof ListUserWalletMovementDTOSchema>
export type ListUserWalletMovementsRequestDTO = z.infer<
  typeof ListUserWalletMovementsRequestDTOSchema
>
export type ListUserWalletMovementsResponseDTO = z.infer<
  typeof ListUserWalletMovementsResponseDTOSchema
>

/**
 * Create User Wallet Movement DTOs (Form data only)
 */
export const CreateWalletMovementDTOSchema = z.object({
  currencyCodes: z.array(z.string()),
  movementTypes: z.array(z.string()),
})
export const CreateWalletMovementRequestSchema = z.object({
  walletId: z.string(),
})
export const CreateWalletMovementResponseSchema = z.object({
  data: CreateWalletMovementDTOSchema,
})

export type CreateWalletMovementDTO = z.infer<typeof CreateWalletMovementDTOSchema>
export type CreateWalletMovementRequest = z.infer<typeof CreateWalletMovementRequestSchema>
export type CreateWalletMovementResponse = z.infer<typeof CreateWalletMovementResponseSchema>

/**
 * Edit User Wallet Movement DTOs (Form data only)
 */
export const EditWalletMovementDTOSchema = z.object({
  movement: z.object({
    movementType: z.string(),
    dateUtc: z.string().optional(),
    institution: z.string().optional(),
    originCurrencyCode: z.string(),
    originAmount: z.number(),
    originExchGrossRate: z.number().optional(),
    originExchOpFee: z.number().optional(),
    originExchVetRate: z.number().optional(),
    resultCurrencyCode: z.string(),
    resultAmount: z.number(),
    details: z.string().optional(),
  }),
  currencyCodes: z.array(z.string()),
  movementTypes: z.array(z.string()),
})
export const EditWalletMovementRequestSchema = z.object({
  walletId: z.string(),
  movementId: z.string(),
})
export const EditWalletMovementResponseSchema = z.object({
  data: EditWalletMovementDTOSchema,
})

export type EditWalletMovementDTO = z.infer<typeof EditWalletMovementDTOSchema>
export type EditWalletMovementRequest = z.infer<typeof EditWalletMovementRequestSchema>
export type EditWalletMovementResponse = z.infer<typeof EditWalletMovementResponseSchema>

/**
 * Store User Wallet Movement DTOs
 */
export const StoreWalletMovementRequestSchema = z.object({
  walletId: z.string(),
  movementType: z.string(),
  institution: z.optional(z.string()),
  dateUtc: z.optional(z.string()),
  originCurrencyCode: z.string(),
  originAmount: z.string(),
  originExchGrossRate: z.optional(z.string()),
  originExchOpFee: z.optional(z.string()),
  resultCurrencyCode: z.string(),
  details: z.optional(z.string()),
})
export const StoreWalletMovementResponseSchema = z.object({
  errors: z.optional(AdonisJSErrorSchema.def.shape.errors),
})

export type StoreWalletMovementRequest = z.infer<typeof StoreWalletMovementRequestSchema>
export type StoreWalletMovementResponse = z.infer<typeof StoreWalletMovementResponseSchema>

/**
 * Update User Wallet Movement DTOs
 */
export const UpdateWalletMovementRequestSchema = z.object({
  movementId: z.string(),
  walletId: z.string(),
  movementType: z.optional(z.string()),
  institution: z.optional(z.string()),
  dateUtc: z.optional(z.string()),
  originCurrencyCode: z.optional(z.string()),
  originAmount: z.optional(z.string()),
  originExchGrossRate: z.optional(z.string()),
  originExchOpFee: z.optional(z.string()),
  resultCurrencyCode: z.optional(z.string()),
  details: z.optional(z.string()),
})
export const UpdateWalletMovementResponseSchema = z.object({
  errors: z.optional(AdonisJSErrorSchema.def.shape.errors),
})

export type UpdateWalletMovementRequest = z.infer<typeof UpdateWalletMovementRequestSchema>
export type UpdateWalletMovementResponse = z.infer<typeof UpdateWalletMovementResponseSchema>
