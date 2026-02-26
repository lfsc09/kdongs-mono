import z from 'zod'

// Local Selectable Wallets
export const LocalSelectableWalletsSchema = z.map(
  // Wallet Id
  z.string(),
  z.null()
)
export type LocalSelectableWallets = z.infer<typeof LocalSelectableWalletsSchema>
