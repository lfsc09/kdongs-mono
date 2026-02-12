import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Big from 'big.js'
import type { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import AssetSefbfr from '#models/investment/asset_sefbfr'

export default class AssetSefbfrSell extends BaseModel {
  static table = 'investment_asset_sefbfr_sells'
  static selfAssignPrimaryKey = true

  @beforeCreate()
  static assignData(assetSefbfrSell: AssetSefbfrSell) {
    assetSefbfrSell.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare investmentAssetSefbfrId: string // ID of the SEFBFR asset to which this sell transaction belongs
  @belongsTo(() => AssetSefbfr)
  declare assetSefbfr: BelongsTo<typeof AssetSefbfr>

  @column()
  declare dateUtc: DateTime // Date of the SEFBFR sell transaction

  @column({
    consume: (value: string) => new Big(value),
    prepare: (value: Big) => value.toString(),
  })
  declare sharesAmount: Big // Amount of shares sold (only negative)

  @column({
    consume: (value: string) => new Big(value),
    prepare: (value: Big) => value.toString(),
  })
  declare priceQuote: Big // Price per share at the time of sell

  @column({
    consume: (value: string | null) => (value ? new Big(value) : null),
    prepare: (value: Big | null) => (value ? value.toString() : null),
  })
  declare fees: Big | null // Fees associated with the sell transaction (only negative)

  @column({
    consume: (value: string | null) => (value ? new Big(value) : null),
    prepare: (value: Big | null) => (value ? value.toString() : null),
  })
  declare taxes: Big | null // Taxes associated with the sell transaction (only negative)

  @column()
  declare details: string | null // Additional details about the sell transaction

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
