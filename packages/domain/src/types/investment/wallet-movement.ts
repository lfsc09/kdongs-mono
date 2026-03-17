export const WalletMovementTypes = {
  deposit: 'deposit',
  withdraw: 'withdraw',
} as const
export type WalletMovementType = keyof typeof WalletMovementTypes
export const acceptedWalletMovementTypes: string[] = Object.values(WalletMovementTypes)
