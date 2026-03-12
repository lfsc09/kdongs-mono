import { showWalletMovementValidator } from '#validators/investment/wallet_movement/show'

export type ShowWalletMovementRequest = Awaited<
  ReturnType<typeof showWalletMovementValidator.validate>
>

// TODO: Add wallet data
export type ShowWalletMovementResponse = {
  data: {
    movementId: string
  }
}
