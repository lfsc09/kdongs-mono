import type { InferInput } from '@vinejs/vine/types'
import type { editWalletSchema } from '#validators/investment/wallet/edit'

export type EditWalletRequest = InferInput<typeof editWalletSchema>
