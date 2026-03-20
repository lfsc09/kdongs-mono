import { CurrencyCode } from '../../../types/investment/currency-code.js'

/**
 * Index
 */
export type IndexWalletRequest = {
  page?: number
  limit?: number
  sortBy?: 'walletName' | 'walletCurrencyCode' | 'walletCreatedAt' | 'walletUpdatedAt'
}

export type IndexWalletResponse = {
  wallets: {
    id: string
    isActive: boolean
    name: string
    currencyCode: CurrencyCode
    trend: 'up' | 'down' | 'stable' | 'unknown'
    initialBalance: number
    currentBalance: number
    profitInCurrency: number
    profitInPerc: number
    createdAt?: string
    updatedAt?: string
  }[]
}

/**
 * Show
 */
export type ShowWalletRequest = {
  walletId: string
}

// TODO: Add wallet data
export type ShowWalletResponse = {
  walletId: string
}

/**
 * Create
 */
export type CreateWalletResponse = {
  currencyCodes: CurrencyCode[]
}

/**
 * Edit
 */
export type EditWalletRequest = {
  walletId: string
}

export type EditWalletResponse = {
  wallet: {
    name: string
    currencyCode: CurrencyCode
  }
  currencyCodes: CurrencyCode[]
}

/**
 * Store
 */
export type StoreWalletRequest = {
  currencyCode: string
  name: string
}

/**
 * Update
 */
export type UpdateWalletRequest = {
  currencyCode?: string
  name?: string
  walletId: string
}

/**
 * Delete
 */
export type DeleteWalletRequest = {
  walletId: string
}
