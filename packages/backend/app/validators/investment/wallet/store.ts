import vine from '@vinejs/vine'
import { acceptedCurrencyCodes } from '../../../core/types/investment/currency.js'

export const storeWalletSchema = vine.object({
  currencyCode: vine.string().in(acceptedCurrencyCodes),
  name: vine.string().minLength(1).maxLength(254),
  userId: vine.string().uuid(),
})

export const storeWalletValidator = vine.create(storeWalletSchema)
