import vine from '@vinejs/vine'
import { acceptedCurrencyCodes } from '../../../core/types/investment/currency.js'

export const performanceAnalyticsSchema = vine.object({
  selectedCurrency: vine.string().in([...acceptedCurrencyCodes, 'Wallet']),
  useLivePriceQuote: vine
    .boolean()
    .optional()
    .transform(v => vine.helpers.isTrue(v)),
  userId: vine.string().uuid(),
  walletIds: vine.unionOfTypes([vine.array(vine.string().uuid()), vine.string().uuid()]).optional(),
})

export const performanceAnalyticsValidator = vine.create(performanceAnalyticsSchema)
