import z from 'zod'
import { SelectableCurrencySchema } from '../../../pages/private/modules/investments/investments.model'
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
  trend: z.enum(['up', 'down', 'stable']),
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
 * Get User Wallet's Performance DTO
 */
export const GetUserWalletsPerformanceIndicatorsDTOSchema = z.object({
  resultingBalanceInCurrency: z.number(),
  resultingProfitInCurrency: z.number(),
  resultingProfitInPerc: z.number(),
  dateStartUtc: z.string(),
  dateEndUtc: z.string(),
  avgDaysByAsset: z.number(),
  numberOfAssets: z.number(),
  numberOfAssetsProfit: z.number(),
  numberOfAssetsLoss: z.number(),
  numberOfActiveAssets: z.number(),
  numberOfActiveAssetsProfit: z.number(),
  numberOfActiveAssetsLoss: z.number(),
  expectancyByAsset: z.number(),
  expectancyByDay: z.number(),
  expectancyByMonth: z.number(),
  expectancyByQuarter: z.number(),
  expectancyByYear: z.number(),
  avgCostByAsset: z.number(),
  avgCostByDay: z.number(),
  avgCostByMonth: z.number(),
  avgCostByQuarter: z.number(),
  avgCostByYear: z.number(),
  avgTaxByAsset: z.number(),
  avgTaxByDay: z.number(),
  avgTaxByMonth: z.number(),
  avgTaxByQuarter: z.number(),
  avgTaxByYear: z.number(),
  breakeven: z.number(),
  edge: z.number(),
  profitSum: z.number(),
  profitAvg: z.number(),
  profitMax: z.number(),
  lossSum: z.number(),
  lossAvg: z.number(),
  lossMax: z.number(),
  historyHigh: z.number(),
  historyLow: z.number(),
})
export const GetUserWalletsPerformanceSerieDTOSchema = z.object({
  type: z.enum(['movement', 'brl_private_bond', 'brl_public_bond', 'sefbfr']),
  walletId: z.string(),
  exitDateUtc: z.string(),
  inputAmount: z.number(),
  grossProfit: z.number(),
  netProfit: z.number(),
  costsAndTaxes: z.number(),
  daysRunning: z.number(),
})
export const GetUserWalletsPerformanceDTOSchema = z.object({
  currencyToShow: z.string(),
  walletIds: z.array(z.string()),
  indicators: GetUserWalletsPerformanceIndicatorsDTOSchema,
  series: z.array(GetUserWalletsPerformanceSerieDTOSchema),
})
export const GetUserWalletsPerformanceRequestDTOSchema = z.object({
  walletIds: z.array(z.string()).optional(),
  selectedCurrency: SelectableCurrencySchema,
})
export const GetUserWalletsPerformanceResponseDTOSchema = z.object({
  data: GetUserWalletsPerformanceDTOSchema,
})

export type GetUserWalletsPerformanceIndicatorsDTO = z.infer<
  typeof GetUserWalletsPerformanceIndicatorsDTOSchema
>
export type GetUserWalletsPerformanceSerieDTO = z.infer<
  typeof GetUserWalletsPerformanceSerieDTOSchema
>
export type GetUserWalletsPerformanceRequestDTO = z.infer<
  typeof GetUserWalletsPerformanceRequestDTOSchema
>
export type GetUserWalletsPerformanceResponseDTO = z.infer<
  typeof GetUserWalletsPerformanceResponseDTOSchema
>
