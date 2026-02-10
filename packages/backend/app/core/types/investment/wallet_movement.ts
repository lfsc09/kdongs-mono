export enum WalletMovementTypes {
  deposit = 'deposit',
  withdraw = 'withdraw',
}
export type WalletMovementType = keyof typeof WalletMovementTypes
export const acceptedWalletMovementTypes: string[] = Object.values(WalletMovementTypes)
