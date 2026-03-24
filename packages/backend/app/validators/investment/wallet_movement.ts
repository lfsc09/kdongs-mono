import { acceptedCurrencyCodes } from '@kdongs-mono/domain/types/investment/currency-code'
import { acceptedWalletMovementTypes } from '@kdongs-mono/domain/types/investment/wallet-movement'
import vine from '@vinejs/vine'
import { paginationValidator } from '#validators/shared/pagination'

export const indexValidator = vine.create({
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
  ...paginationValidator.schema.getProperties(),
  sortBy: vine
    .enum(['movementId', 'movementOriginAmount', 'movementResultAmount', 'movementDateUtc'])
    .optional(),
})

export const showValidator = vine.create({
  movementId: vine.string().uuid(),
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const editValidator = vine.create({
  movementId: vine.string().uuid(),
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const storeValidator = vine.create({
  dateUtc: vine.date(),
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

export const updateValidator = vine.create({
  dateUtc: vine.date().optional(),
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

export const deleteValidator = vine.create({
  movementId: vine.string().uuid(),
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})
