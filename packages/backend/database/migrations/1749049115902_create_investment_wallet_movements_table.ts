import { BaseSchema } from '@adonisjs/lucid/schema'
import { acceptedCurrencyCodes } from '@kdongs-mono/domain/types/investment/currency-code'
import { acceptedWalletMovementTypes } from '@kdongs-mono/domain/types/investment/wallet-movement'

export default class extends BaseSchema {
  protected tableName = 'investment_wallet_movements'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('wallet_id')
        .notNullable()
        .references('id')
        .inTable('investment_wallets')
        .onDelete('CASCADE')

      // Type of the movement
      table.string('movement_type').notNullable().checkIn(acceptedWalletMovementTypes)
      // Date of the movement in UTC
      table.datetime('date_utc').notNullable()
      // Institution where the movement occurred
      table.string('institution').nullable()
      // Currency code of the movement origin
      table.string('origin_currency_code', 3).notNullable().checkIn(acceptedCurrencyCodes)
      // Amount in the origin currency (positive for deposits and negative for withdraws)
      table.decimal('origin_amount', 20, 6).notNullable()
      // Gross exchange rate to convert the origin currency (only positive, for both deposits and withdraws)
      table.decimal('origin_exch_gross_rate', 20, 6).nullable().checkPositive()
      // Exchange operation fee of the origin currency conversion (fee + iof) (only positive, fees increase the exchange rate)
      table.decimal('origin_exch_op_fee', 20, 6).nullable().checkPositive()
      // Final exchange rate to convert the origin currency (considering the gross rate and the operation fee)
      table.decimal('origin_exch_vet_rate', 20, 6).nullable().checkPositive()
      // Currency code to which the origin currency was converted
      table.string('result_currency_code', 3).notNullable().checkIn(acceptedCurrencyCodes)
      // Amount in the result currency (after conversion, only positive for both deposits and withdraws)
      table.decimal('result_amount', 20, 6).notNullable()
      // Additional details about the movement
      table.text('details').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index('wallet_id', 'investment_wallet_movements_wallet_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
