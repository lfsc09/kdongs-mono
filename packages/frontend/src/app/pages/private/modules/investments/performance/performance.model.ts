import { CurrencyCode } from '@kdongs/domain/types/investment/currency-code'

// Selectable Currencies
export type SelectableCurrency = CurrencyCode | 'Wallet'

// User Preferences in Investments Module (to be saved in local storage)
export type UserPreferences = {
  selectedWallets: string[]
  selectedCurrency: SelectableCurrency
}
