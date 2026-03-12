import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import { acceptedCurrencyCodes } from '../../../core/types/investment/currency.js'
import { acceptedWalletMovementTypes } from '../../../core/types/investment/wallet_movement.js'

export const updateWalletMovementSchema = vine.object({
  dateUtc: vine
    .date()
    .transform(value => DateTime.fromJSDate(value))
    .optional(),
  details: vine.string().minLength(1).maxLength(254).optional(),
  institution: vine.string().minLength(1).maxLength(254).optional(),
  movementId: vine.string().uuid(),
  movementType: vine.string().in(acceptedWalletMovementTypes).optional(),
  originAmount: vine.number().positive().optional(),
  originCurrencyCode: vine.string().in(acceptedCurrencyCodes).optional(),
  originExchGrossRate: vine.number().positive().optional(),
  originExchOpFee: vine.number().negative().optional(),
  resultCurrencyCode: vine.string().in(acceptedCurrencyCodes).optional(),
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const updateWalletMovementValidator = vine.create(updateWalletMovementSchema)
