import { editWalletValidator } from '#validators/investment/wallet/edit'
import { CurrencyCode } from '../../../types/investment/currency.js'

export type EditWalletRequest = Awaited<ReturnType<typeof editWalletValidator.validate>>

export type EditWalletResponse = {
  data: {
    wallet: {
      name: string
      currencyCode: CurrencyCode
    }
    currencyCodes: CurrencyCode[]
  }
}
