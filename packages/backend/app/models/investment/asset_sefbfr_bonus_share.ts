import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Big from 'big.js'
import type { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import AssetSefbfr from '#models/investment/asset_sefbfr'

export default class AssetSefbfrBonusShare extends BaseModel {
  static table = 'investment_asset_sefbfr_bonus_shares'
  static selfAssignPrimaryKey = true

  @beforeCreate()
  static assignData(assetSefbfrBonusShare: AssetSefbfrBonusShare) {
    assetSefbfrBonusShare.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare investmentAssetSefbfrId: string // ID of the SEFBFR asset to which this bonus share belongs
  @belongsTo(() => AssetSefbfr)
  declare assetSefbfr: BelongsTo<typeof AssetSefbfr>

  @column()
  declare dateUtc: DateTime // Date of the SEFBFR bonus shares transaction

  @column({
    consume: (value: string) => new Big(value),
    prepare: (value: Big) => value.toString(),
  })
  declare value: Big // Value of the bonus shares received

  @column({
    consume: (value: string) => new Big(value),
    prepare: (value: Big) => value.toString(),
  })
  declare factor: Big // Factor by which the shares are increased (always percentage)

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
