import vine from '@vinejs/vine'

export const deleteWalletMovementSchema = vine.object({
  movementId: vine.string().uuid(),
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const deleteWalletMovementValidator = vine.create(deleteWalletMovementSchema)
