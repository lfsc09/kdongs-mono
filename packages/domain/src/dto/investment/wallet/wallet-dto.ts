import { CurrencyCode } from '../../../types/investment/currency-code.js'

/**
 * Index
 */
export type IndexWalletRequest = {
  userId: string
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
  userId: string
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
  userId: string
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
  userId: string
}

/**
 * Update
 */
export type UpdateWalletRequest = {
  currencyCode?: string
  name?: string
  userId: string
  walletId: string
}

/**
 * Delete
 */
export type DeleteWalletRequest = {
  userId: string
  walletId: string
}
