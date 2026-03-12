import vine from '@vinejs/vine'

export const showWalletMovementSchema = vine.object({
  movementId: vine.string().uuid(),
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const showWalletMovementValidator = vine.create(showWalletMovementSchema)
