import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'investment_asset_sefbfr_buys'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('investment_asset_sefbfr_id')
        .notNullable()
        .references('id')
        .inTable('investment_asset_sefbfrs')
        .onDelete('CASCADE')

      table.datetime('date_utc').notNullable() // Date of the SEFBFR buy transaction
      table.decimal('shares_amount', 20, 6).notNullable() // Amount of shares bought
      table.decimal('price_quote', 20, 6).notNullable() // Price per share at the time of purchase
      table.decimal('fees', 20, 6).nullable() // Fees associated with the buy transaction
      table.text('details').nullable() // Additional details about the buy transaction

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(
        'investment_asset_sefbfr_id',
        'investment_asset_sefbfr_buys_investment_asset_sefbfr_id_index',
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
