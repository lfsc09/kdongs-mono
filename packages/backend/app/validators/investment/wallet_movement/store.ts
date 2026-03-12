import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import { acceptedCurrencyCodes } from '../../../core/types/investment/currency.js'
import { acceptedWalletMovementTypes } from '../../../core/types/investment/wallet_movement.js'

export const storeWalletMovementSchema = vine.object({
  dateUtc: vine.date().transform(value => DateTime.fromJSDate(value)),
  details: vine.string().minLength(1).maxLength(254).optional(),
  institution: vine.string().minLength(1).maxLength(254).optional(),
  movementType: vine.string().in(acceptedWalletMovementTypes),
  originAmount: vine.number().positive(),
  originCurrencyCode: vine.string().in(acceptedCurrencyCodes),
  originExchGrossRate: vine
    .number()
    .positive()
    .optional()
    .requiredWhen('originCurrencyCode', '!=', 'resultCurrencyCode'),
  originExchOpFee: vine
    .number()
    .negative()
    .optional()
    .requiredWhen('originCurrencyCode', '!=', 'resultCurrencyCode'),
  resultCurrencyCode: vine.string().in(acceptedCurrencyCodes),
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const storeWalletMovementValidator = vine.create(storeWalletMovementSchema)
