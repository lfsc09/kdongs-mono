import z from 'zod'
import {
  PaginationRequestSchema,
  PaginationResponseSchema,
  SortOrderSchema,
} from '../shared/default-gateway.model'

export const ListUserWalletDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  currencyCode: z.string(),
  trend: z.enum(['up', 'down', 'stable']),
  initialBalance: z.number(),
  currentBalance: z.number(),
  profitInCurncy: z.number(),
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
