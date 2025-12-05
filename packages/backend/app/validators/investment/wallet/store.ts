import vine from '@vinejs/vine'
import { acceptedCurrencyCodes } from '../../../core/types/investment/currencies.js'

export const storeWalletValidator = vine.compile(
  vine.object({
    currencyCode: vine.string().in(acceptedCurrencyCodes),
    name: vine.string().minLength(1).maxLength(254),
    userId: vine.string().uuid(),
  }),
)
