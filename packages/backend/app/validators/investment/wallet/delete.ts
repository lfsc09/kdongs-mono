import vine from '@vinejs/vine'

export const deleteWalletValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid(),
    walletId: vine.string().uuid(),
  }),
)
