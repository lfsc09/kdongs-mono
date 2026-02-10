import type { InferInput } from '@vinejs/vine/types'
import type { deleteWalletSchema } from '#validators/investment/wallet/delete'

export type DeleteWalletRequest = InferInput<typeof deleteWalletSchema>
