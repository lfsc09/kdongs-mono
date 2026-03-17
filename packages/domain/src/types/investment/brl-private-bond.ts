export const BondTypes = {
  cdb: 'cdb',
  lca: 'lca',
  lci: 'lci',
} as const
export const BondTypesTranslation = {
  cdb: 'CDB',
  lca: 'LCA',
  lci: 'LCI',
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
  cdi_perc: 'cdi_perc',
} as const
export const IndexTypesTranslation = {
  aa: 'a.a%',
  cdi_perc: '% of cdi',
} as const
export type IndexType = keyof typeof IndexTypes
export const acceptedIndexTypes: string[] = Object.values(IndexTypes)
