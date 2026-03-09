import type { deleteWalletValidator } from '#validators/investment/wallet/delete'

export type DeleteWalletRequest = Awaited<ReturnType<typeof deleteWalletValidator.validate>>
