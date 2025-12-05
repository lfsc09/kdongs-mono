import type { InferInput } from '@vinejs/vine/types'
import type { editWalletValidator } from '#validators/investment/wallet/edit'

export type EditWalletRequest = InferInput<typeof editWalletValidator>
