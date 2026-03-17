export const BondTypes = {
  lft: 'lft',
  ltn: 'ltn',
} as const
export const BondTypesTranslation = {
  lft: 'LFT',
  ltn: 'LTN',
} as const
export type BondType = keyof typeof BondTypes
export const acceptedBondTypes: string[] = Object.values(BondTypes)

export const InterestTypes = {
  fixed: 'fixed',
  variable: 'variable',
} as const
export type InterestType = keyof typeof InterestTypes
export const acceptedInterestTypes: string[] = Object.values(InterestTypes)

export const IndexTypes = {
  aa: 'aa',
  selic_plus_perc: 'selic_plus_perc',
} as const
export const IndexTypesTranslation = {
  aa: 'a.a%',
  selic_plus_perc: 'selic + %',
} as const
export type IndexType = keyof typeof IndexTypes
export const acceptedIndexTypes: string[] = Object.values(IndexTypes)

export const TransactionTypes = {
  buy: 'buy',
  sell: 'sell',
} as const
export type TransactionType = keyof typeof TransactionTypes
export const acceptedTransactionTypes: string[] = Object.values(TransactionTypes)
