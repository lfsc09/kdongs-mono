import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Big from 'big.js'
import type { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import Wallet from '#models/investment/wallet'
import type { CurrencyCode } from '../../core/types/investment/currency.js'
import type { WalletMovementType } from '../../core/types/investment/wallet_movement.js'

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
  declare walletId: string // ID of the wallet to which the movement belongs
  @belongsTo(() => Wallet)
  declare wallet: BelongsTo<typeof Wallet>

  @column()
  declare movementType: WalletMovementType // Type of movement

  @column.dateTime()
  declare dateUtc: DateTime // Date of the movement in UTC

  @column()
  declare institution: string | null // Institution where the movement occurred

  @column()
  declare originCurrencyCode: CurrencyCode // Currency code of the movement origin

  @column({
    consume: (value: string) => new Big(value),
    prepare: (value: Big) => value.toString(),
  })
  declare originAmount: Big // Amount in the origin currency (only positive, for both deposits and withdraws)

  @column({
    consume: (value: string | null) => (value ? new Big(value) : null),
    prepare: (value: Big | null) => (value ? value.toString() : null),
  })
  declare originExchGrossRate: Big | null // Gross exchange rate to convert the origin currency (only positive, for both deposits and withdraws)

  @column({
    consume: (value: string | null) => (value ? new Big(value) : null),
    prepare: (value: Big | null) => (value ? value.toString() : null),
  })
  declare originExchOpFee: Big | null // Exchange operation fee of the origin currency conversion (fee + iof) (only negative)

  @column({
    consume: (value: string | null) => (value ? new Big(value) : null),
    prepare: (value: Big | null) => (value ? value.toString() : null),
  })
  declare originExchVetRate: Big | null // Final exchange rate to convert the origin currency (considering the gross rate and the operation fee) (only positive, for both deposits and withdraws)

  @column()
  declare resultCurrencyCode: CurrencyCode // Currency code to which the origin currency was converted

  @column({
    consume: (value: string) => new Big(value),
    prepare: (value: Big) => value.toString(),
  })
  declare resultAmount: Big // Amount in the result currency (only positive, for both deposits and withdraws)

  @column()
  declare details: string | null // Additional details about the movement

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
