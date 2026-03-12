import vine from '@vinejs/vine'
import { paginationSchema } from '#validators/shared/pagination'

export const indexWalletMovementsSchema = vine.object({
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
  ...paginationSchema.getProperties(),
  sortBy: vine
    .enum(['movementId', 'movementOriginAmount', 'movementResultAmount', 'movementDateUtc'])
    .optional(),
})

export const indexWalletMovementsValidator = vine.create(indexWalletMovementsSchema)
