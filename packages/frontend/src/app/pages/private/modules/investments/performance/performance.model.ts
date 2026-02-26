import z from 'zod'

// Supported Currencies
export const CurrencySchema = z.enum(['USD', 'EUR', 'BRL'])
export type Currency = z.infer<typeof CurrencySchema>

// Selectable Currencies
export const SelectableCurrencySchema = z.enum([...CurrencySchema.options, 'Wallet'])
export type SelectableCurrency = z.infer<typeof SelectableCurrencySchema>

// User Preferences in Investments Module (to be saved in local storage)
export const UserPreferencesSchema = z.object({
  selectedWallets: z.array(z.string()),
  selectedCurrency: SelectableCurrencySchema,
})
export type UserPreferences = z.infer<typeof UserPreferencesSchema>
