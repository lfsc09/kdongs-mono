export enum BondTypes {
  LTN = 'LTN',
  LFT = 'LFT',
}
export type BondType = keyof typeof BondTypes
export const acceptedBondTypes: string[] = Object.values(BondTypes)

export enum InterestTypes {
  fixed = 'fixed',
  variable = 'variable',
}
export type InterestType = keyof typeof InterestTypes
export const acceptedInterestTypes: string[] = Object.values(InterestTypes)

export enum IndexTypes {
  aa = 'aa',
  selic_plus_perc = 'selic_plus_perc',
}
export enum IndexTypesTranslation {
  aa = 'a.a%',
  selic_plus_perc = 'selic + %',
}
export type IndexType = keyof typeof IndexTypes
export const acceptedIndexTypes: string[] = Object.values(IndexTypes)

export enum TransactionTypes {
  buy = 'buy',
  sell = 'sell',
}
export type TransactionType = keyof typeof TransactionTypes
export const acceptedTransactionTypes: string[] = Object.values(TransactionTypes)
