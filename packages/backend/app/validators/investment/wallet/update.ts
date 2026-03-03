import vine from '@vinejs/vine'
import { acceptedCurrencyCodes } from '../../../core/types/investment/currency.js'

export const updateWalletSchema = vine.object({
  currencyCode: vine.string().in(acceptedCurrencyCodes).optional(),
  name: vine.string().minLength(1).maxLength(254).optional(),
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const updateWalletValidator = vine.create(updateWalletSchema)
