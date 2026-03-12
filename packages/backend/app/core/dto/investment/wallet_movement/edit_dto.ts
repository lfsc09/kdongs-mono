import { editWalletMovementValidator } from '#validators/investment/wallet_movement/edit'
import { CurrencyCode } from '../../../types/investment/currency.js'
import { WalletMovementType } from '../../../types/investment/wallet_movement.js'

export type EditWalletMovementRequest = Awaited<
  ReturnType<typeof editWalletMovementValidator.validate>
>

export type EditWalletMovementResponse = {
  data: {
    movement: {
      movementType: WalletMovementType
      dateUtc: string | undefined
      institution: string | undefined
      originCurrencyCode: CurrencyCode
      originAmount: number
      originExchGrossRate: number | undefined
      originExchOpFee: number | undefined
      originExchVetRate: number | undefined
      resultCurrencyCode: CurrencyCode
      resultAmount: number
      details: string | undefined
    }
    currencyCodes: CurrencyCode[]
    movementTypes: WalletMovementType[]
  }
}
