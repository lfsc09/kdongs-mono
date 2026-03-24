import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type {
  BondType,
  IndexType,
  InterestType,
} from '@kdongs-mono/domain/types/investment/brl-public-bond'
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import AssetBrlPublicBondBuy from '#models/investment/asset_brl_public_bond_buy'
import AssetBrlPublicBondSell from '#models/investment/asset_brl_public_bond_sell'
import Wallet from '#models/investment/wallet'

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
  declare walletId: string
  @belongsTo(() => Wallet)
  declare wallet: BelongsTo<typeof Wallet>

  @column()
  declare isDone: boolean

  @column()
  declare holderInstitution: string

  @column()
  declare bondName: string

  @column()
  declare bondType: BondType

  @column()
  declare interestType: InterestType

  @column()
  declare indexType: IndexType

  @column.dateTime()
  declare maturityDateUtc: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => AssetBrlPublicBondBuy, { foreignKey: 'investmentAssetBrlPublicBondId' })
  declare assetBrlPublicBondBuys: HasMany<typeof AssetBrlPublicBondBuy>

  @hasMany(() => AssetBrlPublicBondSell, { foreignKey: 'investmentAssetBrlPublicBondId' })
  declare assetBrlPublicBondSells: HasMany<typeof AssetBrlPublicBondSell>
}
