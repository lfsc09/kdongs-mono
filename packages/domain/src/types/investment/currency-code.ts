export const CurrencyCodes = {
  BRL: 'BRL',
  EUR: 'EUR',
  USD: 'USD',
} as const
export type CurrencyCode = keyof typeof CurrencyCodes
export const acceptedCurrencyCodes: string[] = Object.values(CurrencyCodes)
