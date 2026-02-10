export enum Currencies {
  USD = 'USD',
  BRL = 'BRL',
  EUR = 'EUR',
}
export type CurrencyCode = keyof typeof Currencies
export const acceptedCurrencyCodes: string[] = Object.values(Currencies)
