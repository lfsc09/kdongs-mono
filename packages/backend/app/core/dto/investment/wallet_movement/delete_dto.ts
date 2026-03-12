import { deleteWalletMovementValidator } from '#validators/investment/wallet_movement/delete'

export type DeleteWalletMovementRequest = Awaited<
  ReturnType<typeof deleteWalletMovementValidator.validate>
>
