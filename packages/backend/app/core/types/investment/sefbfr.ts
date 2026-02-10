export enum DoneStates {
  active = 'active',
  done = 'done',
  transfered = 'transfered',
}
export type DoneState = keyof typeof DoneStates
export const acceptedDoneStates: string[] = Object.values(DoneStates)

export enum TransactionTypes {
  buy = 'buy',
  sell = 'sell',
  transfer = 'transfer',
  bonusShare = 'bonusShare',
  split = 'split',
  inplit = 'inplit',
  dividend = 'dividend',
}
export type TransactionType = keyof typeof TransactionTypes
export const acceptedTransactionTypes: string[] = Object.values(TransactionTypes)
