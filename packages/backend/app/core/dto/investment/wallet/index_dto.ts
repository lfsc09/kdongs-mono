import { indexWalletsValidator } from '#validators/investment/wallet/index'
import type { PaginationResponse } from '../../shared/pagination_dto.js'

export type IndexWalletsRequest = Awaited<ReturnType<typeof indexWalletsValidator.validate>>

export type IndexWalletsResponse = {
  data: {
    wallets: {
      id: string
      isActive: boolean
      name: string
      currencyCode: string
      trend: 'up' | 'down' | 'stable' | 'unknown'
      initialBalance: number
      currentBalance: number
      profitInCurrency: number
      profitInPerc: number
      createdAt: string | undefined
      updatedAt: string | undefined
    }[]
  }
  metadata: PaginationResponse
}
