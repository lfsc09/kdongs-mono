import vine from '@vinejs/vine'
import { acceptedCurrencyCodes } from '../../../core/types/investment/currencies.js'

export const handleSelectedWalletsPerformanceValidator = vine.compile(
  vine.object({
    selectedCurrency: vine.string().in([...acceptedCurrencyCodes, 'Wallet']),
    userId: vine.string().uuid(),
    walletIds: vine
      .unionOfTypes([vine.array(vine.string().uuid()), vine.string().uuid()])
      .optional(),
  }),
)
