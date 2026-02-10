import type { InferInput } from '@vinejs/vine/types'
import type { storeWalletSchema } from '#validators/investment/wallet/store'

export type StoreWalletRequest = InferInput<typeof storeWalletSchema>
