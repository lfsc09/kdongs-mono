import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Big from 'big.js'
import type { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import Wallet from '#models/investment/wallet'
import type {
  BondType,
  IndexType,
  InterestType,
} from '../../core/types/investment/brl_private_bonds.js'

export default class AssetBrlPrivateBond extends BaseModel {
  static table = 'investment_asset_brl_private_bonds'
  static selfAssignPrimaryKey = true

  @beforeCreate()
  static assignData(assetBrlPrivateBond: AssetBrlPrivateBond) {
    assetBrlPrivateBond.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare walletId: string // ID of the wallet to which the bond investment belongs
  @belongsTo(() => Wallet)
  declare wallet: BelongsTo<typeof Wallet>

  @column()
  declare isDone: boolean // Indicates if the bond investment is completed

  @column()
  declare holderInstitution: string // Institution where the bond is held

  @column()
  declare emitterInstitution: string // Institution that issued the bond

  @column()
  declare bondName: string // Name of the bond

  @column()
  declare bondType: BondType // Type of the bond

  @column()
  declare interestType: InterestType // Type of interest

  @column()
  declare indexType: IndexType // Index type

  @column({
    consume: (value: string) => new Big(value),
    prepare: (value: Big) => value.toString(),
  })
  declare indexValue: Big // Value of the index

  @column.dateTime()
  declare maturityDateUtc: DateTime // Maturity date of the bond in UTC

  @column.dateTime()
  declare enterDateUtc: DateTime // Date when the bond was acquired in UTC

  @column.dateTime()
  declare exitDateUtc: DateTime | null // Date when the bond was sold or ended in UTC

  @column({
    consume: (value: string) => new Big(value),
    prepare: (value: Big) => value.toString(),
  })
  declare inputAmount: Big // Amount invested in the bond

  @column({
    consume: (value: string | null) => (value ? new Big(value) : null),
    prepare: (value: Big | null) => (value ? value.toString() : null),
  })
  declare grossAmount: Big | null // Gross amount of the bond

  @column({
    consume: (value: string | null) => (value ? new Big(value) : null),
    prepare: (value: Big | null) => (value ? value.toString() : null),
  })
  declare fees: Big | null // Fees associated with the bond (e.g., brokerage fees, IOF, etc.) (only negative)

  @column({
    consume: (value: string | null) => (value ? new Big(value) : null),
    prepare: (value: Big | null) => (value ? value.toString() : null),
  })
  declare taxes: Big | null // Other taxes applied to the bond (only negative)

  @column()
  declare details: string | null // Additional details about the bond

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
