import { updateWalletValidator } from '#validators/investment/wallet/update'

export type UpdateWalletRequest = Awaited<ReturnType<typeof updateWalletValidator.validate>>
