import { acceptedCurrencyCodes } from '@kdongs-mono/domain/types/investment/currency-code'
import vine from '@vinejs/vine'

export const performanceValidator = vine.create({
  selectedCurrency: vine.string().in([...acceptedCurrencyCodes, 'Wallet']),
  useLivePriceQuote: vine
    .boolean()
    .optional()
    .transform(v => vine.helpers.isTrue(v)),
  userId: vine.string().uuid(),
  walletIds: vine.unionOfTypes([vine.array(vine.string().uuid()), vine.string().uuid()]).optional(),
})

export const liquidationSeriesValidator = vine.create({
  selectedCurrency: vine.string().in([...acceptedCurrencyCodes]),
  useLivePriceQuote: vine
    .boolean()
    .optional()
    .transform(v => vine.helpers.isTrue(v)),
  userId: vine.string().uuid(),
  walletIds: vine.unionOfTypes([vine.array(vine.string().uuid()), vine.string().uuid()]).optional(),
})
