import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'investment_asset_sefbfr_sells'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('investment_asset_sefbfr_id')
        .notNullable()
        .references('id')
        .inTable('investment_asset_sefbfrs')
        .onDelete('CASCADE')

      // Date of the SEFBFR sell transaction in UTC
      table.datetime('date_utc').notNullable()
      // Amount of shares sold (only negative)
      table.decimal('shares_amount', 20, 6).notNullable().checkNegative()
      // Price per share at the time of sale (only positive)
      table.decimal('price_quote', 20, 6).notNullable().checkPositive()
      // Fees associated with the sell transaction (only negative)
      table.decimal('fees', 20, 6).nullable().checkNegative()
      // Taxes associated with the sell transaction (only negative)
      table.decimal('taxes', 20, 6).nullable().checkNegative()
      // Additional details about the sell transaction
      table.text('details').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(
        'investment_asset_sefbfr_id',
        'investment_asset_sefbfr_sells_investment_asset_sefbfr_id_index',
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
