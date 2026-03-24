import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Big from 'big.js'
import type { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { consumeBig, prepareBig } from '#models/helper/big'
import AssetSefbfr from '#models/investment/asset_sefbfr'

export default class AssetSefbfrTransfer extends BaseModel {
  static table = 'investment_asset_sefbfr_transfers'
  static selfAssignPrimaryKey = true

  @beforeCreate()
  static assignData(assetSefbfrTransfer: AssetSefbfrTransfer) {
    assetSefbfrTransfer.id = uuidv7()
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
    prepare: prepareBig,
  })
  declare sharesAmount: Big

  @column({
    consume: consumeBig,
    prepare: prepareBig,
  })
  declare closePriceQuote: Big

  @column()
  declare previousInstitution: string

  @column()
  declare newInstitution: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
