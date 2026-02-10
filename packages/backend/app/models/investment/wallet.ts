import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import AssetBrlPrivateBond from '#models/investment/asset_brl_private_bond'
import AssetBrlPublicBond from '#models/investment/asset_brl_public_bond'
import AssetSefbfr from '#models/investment/asset_sefbfr'
import WalletMovement from '#models/investment/wallet_movement'
import User from '#models/user/user'
import type { CurrencyCode } from '../../core/types/investment/currency.js'

export default class Wallet extends BaseModel {
  static table = 'investment_wallets'
  static selfAssignPrimaryKey = true

  public async softDelete() {
    this.deletedAt = DateTime.now()
    await (this.constructor as typeof BaseModel).query().where('id', this.id).update({
      deletedAt: this.deletedAt,
    })
  }

  @beforeCreate()
  static assignData(wallet: Wallet) {
    wallet.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string // ID of the user who owns the wallet
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare name: string // Name of the investment wallet

  @column()
  declare currencyCode: CurrencyCode // Wallet currency code

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @hasMany(() => WalletMovement, { foreignKey: 'walletId' })
  declare movements: HasMany<typeof WalletMovement>

  @hasMany(() => AssetBrlPrivateBond, { foreignKey: 'walletId' })
  declare assetBrlPrivateBonds: HasMany<typeof AssetBrlPrivateBond>

  @hasMany(() => AssetBrlPublicBond, { foreignKey: 'walletId' })
  declare assetBrlPublicBonds: HasMany<typeof AssetBrlPublicBond>

  @hasMany(() => AssetSefbfr, { foreignKey: 'walletId' })
  declare assetSefbfrs: HasMany<typeof AssetSefbfr>
}
