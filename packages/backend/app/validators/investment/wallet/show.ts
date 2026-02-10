import vine from '@vinejs/vine'

export const showWalletSchema = vine.object({
  userId: vine.string().uuid(),
  walletId: vine.string().uuid(),
})

export const showWalletValidator = vine.create(showWalletSchema)
