import { indexWalletMovementsValidator } from '#validators/investment/wallet_movement/index'
import { PaginationResponse } from '../../shared/pagination_dto.js'

export type IndexWalletMovementsRequest = Awaited<
  ReturnType<typeof indexWalletMovementsValidator.validate>
>

export type IndexWalletMovementsResponse = {
  data: {
    movements: {
      id: string
      movementType: string
      hasConversion: boolean
      dateUtc: string | undefined
      originCurrencyCode: string
      originAmount: number
      originExchGrossRate: number | undefined
      originExchOpFee: number | undefined
      originExchVetRate: number | undefined
      resultCurrencyCode: string
      resultAmount: number
      createdAt: string | undefined
      updatedAt: string | undefined
    }[]
  }
  metadata: PaginationResponse
}
