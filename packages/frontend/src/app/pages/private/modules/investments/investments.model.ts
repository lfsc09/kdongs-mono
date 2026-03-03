import z from 'zod'

// Supported Currencies
export const CurrencySchema = z.enum(['USD', 'EUR', 'BRL'])
export type Currency = z.infer<typeof CurrencySchema>
