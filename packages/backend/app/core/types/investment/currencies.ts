const currencyCodesLiteral = ['USD', 'BRL', 'EUR'] as const;
export type CurrencyCode = (typeof currencyCodesLiteral)[number];
export const acceptedCurrencyCodes: string[] = [...currencyCodesLiteral];
