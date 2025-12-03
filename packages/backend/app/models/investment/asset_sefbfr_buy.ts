import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Big from 'big.js'
import type { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
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
  declare investmentAssetSefbfrId: string // ID of the SEFBFR asset to which this buy transaction belongs
  @belongsTo(() => AssetSefbfr)
  declare assetSefbfr: BelongsTo<typeof AssetSefbfr>

  @column()
  declare dateUtc: DateTime // Date of the SEFBFR buy transaction

  @column({
    consume: (value: string) => new Big(value),
    prepare: (value: Big) => value.toString(),
  })
  declare sharesAmount: Big // Amount of shares bought

  @column({
    consume: (value: string) => new Big(value),
    prepare: (value: Big) => value.toString(),
  })
  declare priceQuote: Big // Price per share at the time of purchase

  @column({
    consume: (value: string | null) => (value ? new Big(value) : null),
    prepare: (value: Big | null) => (value ? value.toString() : null),
  })
  declare fees: Big | null // Fees associated with the buy transaction (negative)

  @column()
  declare details: string | null // Additional details about the buy transaction

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
