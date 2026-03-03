import vine from '@vinejs/vine'

export const editWalletSchema = vine.object({
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const editWalletValidator = vine.create(editWalletSchema)
