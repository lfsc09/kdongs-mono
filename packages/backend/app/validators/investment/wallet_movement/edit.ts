import vine from '@vinejs/vine'

export const editWalletMovementSchema = vine.object({
  movementId: vine.string().uuid(),
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const editWalletMovementValidator = vine.create(editWalletMovementSchema)
