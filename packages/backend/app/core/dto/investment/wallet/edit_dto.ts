import type { InferInput } from '@vinejs/vine/types'
import type { editWalletSchema } from '#validators/investment/wallet/edit'
import { CurrencyCode } from '../../../types/investment/currency.js'

export type EditWalletRequest = InferInput<typeof editWalletSchema>

export type EditWalletResponse = {
  data: {
    wallet: {
      name: string
      currencyCode: CurrencyCode
    }
    currencyCodes: CurrencyCode[]
  }
}
