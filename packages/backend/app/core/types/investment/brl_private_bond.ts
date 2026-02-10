export enum BondTypes {
  LCA = 'LCA',
  LCI = 'LCI',
  CDB = 'CDB',
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
  cdi_perc = 'cdi_perc',
}
export enum IndexTypesTranslation {
  aa = 'a.a%',
  cdi_perc = '% of cdi',
}
export type IndexType = keyof typeof IndexTypes
export const acceptedIndexTypes: string[] = Object.values(IndexTypes)
