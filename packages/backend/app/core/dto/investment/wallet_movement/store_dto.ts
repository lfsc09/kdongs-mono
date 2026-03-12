import { storeWalletMovementValidator } from '#validators/investment/wallet_movement/store'

export type StoreWalletMovementRequest = Awaited<
  ReturnType<typeof storeWalletMovementValidator.validate>
>
