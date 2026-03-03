import { InferInput } from '@vinejs/vine/types'
import { updateWalletSchema } from '#validators/investment/wallet/update'

export type UpdateWalletRequest = InferInput<typeof updateWalletSchema>
