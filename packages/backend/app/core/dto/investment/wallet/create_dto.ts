import type { CurrencyCode } from '../../../types/investment/currency.js'

export type CreateWalletResponse = {
  data: {
    currencyCodes: CurrencyCode[]
  }
}
