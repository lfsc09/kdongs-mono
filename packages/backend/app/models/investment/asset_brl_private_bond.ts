import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type {
  BondType,
  IndexType,
  InterestType,
} from '@kdongs-mono/domain/types/investment/brl-private-bond'
import Big from 'big.js'
import type { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import {
  consumeBig,
  consumeNullableBig,
  prepareBig,
  prepareNullableBig,
  prepareNullableNegativeBig,
  preparePositiveBig,
} from '#models/helper/big'
import Wallet from '#models/investment/wallet'

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
  declare walletId: string
  @belongsTo(() => Wallet)
  declare wallet: BelongsTo<typeof Wallet>

  @column()
  declare isDone: boolean

  @column()
  declare holderInstitution: string

  @column()
  declare emitterInstitution: string

  @column()
  declare bondName: string

  @column()
  declare bondType: BondType

  @column()
  declare interestType: InterestType

  @column()
  declare indexType: IndexType

  @column({
    consume: consumeBig,
    prepare: prepareBig,
  })
  declare indexValue: Big

  @column.dateTime()
  declare maturityDateUtc: DateTime

  @column.dateTime()
  declare enterDateUtc: DateTime

  @column.dateTime()
  declare exitDateUtc: DateTime | null

  @column({
    consume: consumeBig,
    prepare: preparePositiveBig,
  })
  declare inputAmount: Big

  @column({
    consume: consumeNullableBig,
    prepare: prepareNullableBig,
  })
  declare grossAmount: Big | null

  @column({
    consume: consumeNullableBig,
    prepare: prepareNullableNegativeBig,
  })
  declare fees: Big | null

  @column({
    consume: consumeNullableBig,
    prepare: prepareNullableNegativeBig,
  })
  declare taxes: Big | null

  @column()
  declare details: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
