import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'investment_asset_sefbfr_dividends'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('investment_asset_sefbfr_id')
        .notNullable()
        .references('id')
        .inTable('investment_asset_sefbfrs')
        .onDelete('CASCADE')

      // Date of the SEFBFR dividend transaction in UTC
      table.datetime('date_utc').notNullable()
      // Value of the dividend received
      table.decimal('value', 20, 6).notNullable()
      // Taxes associated with the dividend transaction (only negative)
      table.decimal('taxes', 20, 6).nullable().checkNegative()
      // Date of the dividend transaction in the company's records in UTC
      table.datetime('date_com_utc').nullable()
      // Date when the dividend was paid in UTC
      table.datetime('date_payment_utc').nullable()
      // Additional details about the dividend transaction
      table.text('details').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(
        'investment_asset_sefbfr_id',
        'investment_asset_sefbfr_dividends_investment_asset_sefbfr_id_index',
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
