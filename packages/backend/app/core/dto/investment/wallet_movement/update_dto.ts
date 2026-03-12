import { updateWalletMovementValidator } from '#validators/investment/wallet_movement/update'

export type UpdateWalletMovementRequest = Awaited<
  ReturnType<typeof updateWalletMovementValidator.validate>
>
