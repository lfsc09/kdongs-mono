import type { InferInput } from '@vinejs/vine/types'
import type { storeWalletValidator } from '#validators/investment/wallet/store'

export type StoreWalletRequest = InferInput<typeof storeWalletValidator>
