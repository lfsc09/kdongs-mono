export type SelectableWalletsMap_Key = string
export type SelectableWalletsMap_Value = { currency: string } | null
export type SelectableWallets = Map<SelectableWalletsMap_Key, SelectableWalletsMap_Value>
export type PossibleSelectableWallets = Map<SelectableWalletsMap_Key, null>
