import type { InferInput } from '@vinejs/vine/types'
import type { deleteWalletValidator } from '#validators/investment/wallet/delete'

export type DeleteWalletRequest = InferInput<typeof deleteWalletValidator>
