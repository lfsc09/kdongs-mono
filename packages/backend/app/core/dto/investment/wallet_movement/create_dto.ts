import type { CurrencyCode } from '../../../types/investment/currency.js'
import { WalletMovementType } from '../../../types/investment/wallet_movement.js'

export type CreateWalletMovementResponse = {
  data: {
    currencyCodes: CurrencyCode[]
    movementTypes: WalletMovementType[]
  }
}
