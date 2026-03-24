import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Big from 'big.js'
import type { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import {
  consumeBig,
  consumeNullableBig,
  prepareNullableNegativeBig,
  preparePositiveBig,
} from '#models/helper/big'
import AssetSefbfr from '#models/investment/asset_sefbfr'

export default class AssetSefbfrBuy extends BaseModel {
  static table = 'investment_asset_sefbfr_buys'
  static selfAssignPrimaryKey = true

  @beforeCreate()
  static assignData(assetSefbfrBuy: AssetSefbfrBuy) {
    assetSefbfrBuy.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare investmentAssetSefbfrId: string
  @belongsTo(() => AssetSefbfr)
  declare assetSefbfr: BelongsTo<typeof AssetSefbfr>

  @column()
  declare dateUtc: DateTime

  @column({
    consume: consumeBig,
    prepare: preparePositiveBig,
  })
  declare sharesAmount: Big

  @column({
    consume: consumeBig,
    prepare: preparePositiveBig,
  })
  declare priceQuote: Big

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
