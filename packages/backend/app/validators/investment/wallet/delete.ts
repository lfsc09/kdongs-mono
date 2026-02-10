import vine from '@vinejs/vine'

export const deleteWalletSchema = vine.object({
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const deleteWalletValidator = vine.create(deleteWalletSchema)
