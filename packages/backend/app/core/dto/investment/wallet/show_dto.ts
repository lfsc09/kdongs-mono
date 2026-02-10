import type { InferInput } from '@vinejs/vine/types'
import type { showWalletSchema } from '#validators/investment/wallet/show'

export type ShowWalletRequest = InferInput<typeof showWalletSchema>

// TODO: Add wallet data
export type ShowWalletResponse = {
  data: {
    walletId: string
  }
}
