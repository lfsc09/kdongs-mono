import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { CurrencyCode } from '@kdongs-mono/domain/types/investment/currency-code'
import type { WalletMovementType } from '@kdongs-mono/domain/types/investment/wallet-movement'
import Big from 'big.js'
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import {
  consumeBig,
  consumeNullableBig,
  prepareBig,
  prepareNullablePositiveBig,
} from '#models/helper/big'
import Wallet from '#models/investment/wallet'

export default class WalletMovement extends BaseModel {
  static table = 'investment_wallet_movements'
  static selfAssignPrimaryKey = true

  @beforeCreate()
  static assignData(walletMovement: WalletMovement) {
    walletMovement.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare walletId: string
  @belongsTo(() => Wallet)
  declare wallet: BelongsTo<typeof Wallet>

  @column()
  declare movementType: WalletMovementType

  @column.dateTime()
  declare dateUtc: DateTime

  @column()
  declare institution: string | null

  @column()
  declare originCurrencyCode: CurrencyCode

  @column({
    consume: consumeBig,
    prepare: prepareBig,
  })
  declare originAmount: Big

  @column({
    consume: consumeNullableBig,
    prepare: prepareNullablePositiveBig,
  })
  declare originExchGrossRate: Big | null

  @column({
    consume: consumeNullableBig,
    prepare: prepareNullablePositiveBig,
  })
  declare originExchOpFee: Big | null

  @column({
    consume: consumeNullableBig,
    prepare: prepareNullablePositiveBig,
  })
  declare originExchVetRate: Big | null

  @column()
  declare resultCurrencyCode: CurrencyCode

  @column({
    consume: consumeBig,
    prepare: prepareBig,
  })
  declare resultAmount: Big

  @column()
  declare details: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
