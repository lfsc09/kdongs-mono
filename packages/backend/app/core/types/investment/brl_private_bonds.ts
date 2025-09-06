const bondTypesLiteral = ['LCA', 'LCI', 'CDB'] as const;
export type BondType = (typeof bondTypesLiteral)[number];
export const acceptedBondTypes: string[] = [...bondTypesLiteral];

const interestTypesLiteral = ['fixed', 'variable'] as const;
export type InterestType = (typeof interestTypesLiteral)[number];
export const acceptedInterestTypes: string[] = [...interestTypesLiteral];

const indexTypesLiteral = ['a.a%', '% of cdi'] as const;
export type IndexType = (typeof indexTypesLiteral)[number];
export const acceptedIndexTypes: string[] = [...indexTypesLiteral];
