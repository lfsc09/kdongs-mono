import { acceptedCurrencyCodes } from '@kdongs-mono/domain/types/investment/currency-code'
import vine from '@vinejs/vine'
import { paginationValidator } from '#validators/shared/pagination'

export const indexValidator = vine.create({
  userId: vine.string().uuid(),
  ...paginationValidator.schema.getProperties(),
  sortBy: vine
    .enum(['walletName', 'walletCurrencyCode', 'walletCreatedAt', 'walletUpdatedAt'])
    .optional(),
})

export const showValidator = vine.create({
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const editValidator = vine.create({
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const storeValidator = vine.create({
  currencyCode: vine.string().in(acceptedCurrencyCodes),
  name: vine.string().minLength(1).maxLength(254),
  userId: vine.string().uuid(),
})

export const updateValidator = vine.create({
  currencyCode: vine.string().in(acceptedCurrencyCodes).optional(),
  name: vine.string().minLength(1).maxLength(254).optional(),
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const deleteValidator = vine.create({
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})
