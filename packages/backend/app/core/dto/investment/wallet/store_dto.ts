import { storeWalletValidator } from '#validators/investment/wallet/store'

export type StoreWalletRequest = Awaited<ReturnType<typeof storeWalletValidator.validate>>
