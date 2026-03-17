export const DoneStates = {
  active: 'active',
  done: 'done',
  transfered: 'transfered',
} as const
export type DoneState = keyof typeof DoneStates
export const acceptedDoneStates: string[] = Object.values(DoneStates)

export const TransactionTypes = {
  bonusShare: 'bonusShare',
  buy: 'buy',
  dividend: 'dividend',
  inplit: 'inplit',
  sell: 'sell',
  split: 'split',
  transfer: 'transfer',
} as const
export type TransactionType = keyof typeof TransactionTypes
export const acceptedTransactionTypes: string[] = Object.values(TransactionTypes)
