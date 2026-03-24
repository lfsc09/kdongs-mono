import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Big from 'big.js'
import type { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import {
  consumeBig,
  consumeNullableBig,
  prepareBig,
  prepareNullableNegativeBig,
  preparePositiveBig,
} from '#models/helper/big'
import AssetBrlPublicBond from '#models/investment/asset_brl_public_bond'

export default class AssetBrlPublicBondBuy extends BaseModel {
  static table = 'investment_asset_brl_public_bond_buys'
  static selfAssignPrimaryKey = true

  @beforeCreate()
  static assignData(assetBrlPublicBondBuy: AssetBrlPublicBondBuy) {
    assetBrlPublicBondBuy.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare investmentAssetBrlPublicBondId: string
  @belongsTo(() => AssetBrlPublicBond)
  declare assetBrlPublicBond: BelongsTo<typeof AssetBrlPublicBond>

  @column.dateTime()
  declare dateUtc: DateTime

  @column({
    consume: consumeBig,
    prepare: prepareBig,
  })
  declare indexValue: Big

  @column({
    consume: consumeBig,
    prepare: preparePositiveBig,
  })
  declare unitPrice: Big

  @column({
    consume: consumeBig,
    prepare: preparePositiveBig,
  })
  declare sharesAmount: Big

  @column({
    consume: consumeNullableBig,
    prepare: prepareNullableNegativeBig,
  })
  declare fees: Big | null

  @column()
  declare details: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
