import { BaseSchema } from '@adonisjs/lucid/schema'
import { acceptedCurrencyCodes } from '@kdongs-mono/domain/types/investment/currency-code'

export default class extends BaseSchema {
  protected tableName = 'investment_wallets'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

      // Name of the investment wallet
      table.string('name').notNullable().unique()
      // Wallet currency code (e.g., USD, BRL)
      table.string('currency_code', 3).notNullable().checkIn(acceptedCurrencyCodes)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()

      table.index('user_id', 'investment_wallets_user_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
