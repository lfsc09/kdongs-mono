import type { InferInput } from '@vinejs/vine/types'
import type { indexWalletsSchema } from '#validators/investment/wallet/index'
import type { PaginationResponse } from '../../shared/pagination_dto.js'

export type IndexWalletsRequest = InferInput<typeof indexWalletsSchema>

export type IndexWalletsResponse = {
  data: {
    wallets: {
      id: string
      name: string
      currencyCode: string
      trend: 'up' | 'down' | 'stable' | 'unknown'
      initialBalance: number
      currentBalance: number
      profitInCurrency: number
      profitInPerc: number
      createdAt?: string
      updatedAt?: string
    }[]
  }
  metadata: PaginationResponse
}
