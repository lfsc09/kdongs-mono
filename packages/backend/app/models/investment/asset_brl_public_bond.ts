import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import AssetBrlPublicBondBuy from '#models/investment/asset_brl_public_bond_buy'
import AssetBrlPublicBondSell from '#models/investment/asset_brl_public_bond_sell'
import Wallet from '#models/investment/wallet'
import type {
  BondType,
  IndexType,
  InterestType,
} from '../../core/types/investment/brl_public_bond.js'

export default class AssetBrlPublicBond extends BaseModel {
  static table = 'investment_asset_brl_public_bonds'
  static selfAssignPrimaryKey = true

  @beforeCreate()
  static assignData(assetBrlPublicBond: AssetBrlPublicBond) {
    assetBrlPublicBond.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare walletId: string // ID of the wallet to which the bond belongs
  @belongsTo(() => Wallet)
  declare wallet: BelongsTo<typeof Wallet>

  @column()
  declare isDone: boolean // Indicates if the bond is completed

  @column()
  declare holderInstitution: string // Institution holding the bond

  @column()
  declare bondName: string // Name of the public bond investment

  @column()
  declare bondType: BondType // Type of bond

  @column()
  declare interestType: InterestType // Type of interest

  @column()
  declare indexType: IndexType // Type of index

  @column.dateTime()
  declare maturityDateUtc: DateTime // Maturity date of the bond

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => AssetBrlPublicBondBuy, { foreignKey: 'investmentAssetBrlPublicBondId' })
  declare assetBrlPublicBondBuys: HasMany<typeof AssetBrlPublicBondBuy>

  @hasMany(() => AssetBrlPublicBondSell, { foreignKey: 'investmentAssetBrlPublicBondId' })
  declare assetBrlPublicBondSells: HasMany<typeof AssetBrlPublicBondSell>
}
