import { showWalletValidator } from '#validators/investment/wallet/show'

export type ShowWalletRequest = Awaited<ReturnType<typeof showWalletValidator.validate>>

// TODO: Add wallet data
export type ShowWalletResponse = {
  data: {
    walletId: string
  }
}
