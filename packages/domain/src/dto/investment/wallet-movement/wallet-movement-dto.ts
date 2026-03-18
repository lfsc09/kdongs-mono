import { CurrencyCode } from '../../../types/investment/currency-code.js'
import { WalletMovementType } from '../../../types/investment/wallet-movement.js'

/**
 * Index
 */
export type IndexWalletMovementRequest = {
  userId: string
  walletId: string
  page: number
  pageSize: number
  sortBy?: 'movementId' | 'movementOriginAmount' | 'movementResultAmount' | 'movementDateUtc'
}

export type IndexWalletMovementResponse = {
  movements: {
    id: string
    movementType: WalletMovementType
    hasConversion: boolean
    dateUtc?: string
    originCurrencyCode: CurrencyCode
    originAmount: number
    originExchGrossRate?: number
    originExchOpFee?: number
    originExchVetRate?: number
    resultCurrencyCode: CurrencyCode
    resultAmount: number
    createdAt?: string
    updatedAt?: string
  }[]
}

/**
 * Show
 */
export type ShowWalletMovementRequest = {
  movementId: string
  userId: string
  walletId: string
}

// TODO: Add wallet data
export type ShowWalletMovementResponse = {
  movementId: string
  userId: string
}

/**
 * Create
 */
export type CreateWalletMovementRequest = {
  walletId: string
}

export type CreateWalletMovementResponse = {
  currencyCodes: CurrencyCode[]
  movementTypes: WalletMovementType[]
}

/**
 * Edit
 */
export type EditWalletMovementRequest = {
  movementId: string
  userId: string
  walletId: string
}

export type EditWalletMovementResponse = {
  movement: {
    movementType: WalletMovementType
    dateUtc?: string
    institution?: string
    originCurrencyCode: CurrencyCode
    originAmount: number
    originExchGrossRate?: number
    originExchOpFee?: number
    originExchVetRate?: number
    resultCurrencyCode: CurrencyCode
    resultAmount: number
    details?: string
  }
  currencyCodes: CurrencyCode[]
  movementTypes: WalletMovementType[]
}

/**
 * Store
 */
export type StoreWalletMovementRequest = {
  dateUtc: Date
  details?: string
  institution?: string
  movementType: string
  originAmount: number
  originCurrencyCode: string
  originExchGrossRate?: number
  originExchOpFee?: number
  resultCurrencyCode: string
  userId: string
  walletId: string
}

/**
 * Update
 */
export type UpdateWalletMovementRequest = {
  movementId: string
  dateUtc?: Date
  details?: string
  institution?: string
  movementType?: string
  originAmount?: number
  originCurrencyCode?: string
  originExchGrossRate?: number
  originExchOpFee?: number
  resultCurrencyCode?: string
  userId: string
  walletId: string
}

/**
 * Delete
 */
export type DeleteWalletMovementRequest = {
  movementId: string
  userId: string
  walletId: string
}
