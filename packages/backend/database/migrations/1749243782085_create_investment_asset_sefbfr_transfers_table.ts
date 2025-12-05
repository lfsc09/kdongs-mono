import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'investment_asset_sefbfr_transfers'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('investment_asset_sefbfr_id')
        .notNullable()
        .references('id')
        .inTable('investment_asset_sefbfrs')
        .onDelete('CASCADE')

      table.datetime('date_utc').notNullable() // Date of the SEFBFR transfer transaction
      table.decimal('shares_amount', 20, 6).notNullable() // Amount of shares transferred
      table.decimal('close_price_quote', 20, 6).notNullable() // Previous day closing price per share of transfer
      table.string('previous_institution', 500).notNullable() // Previous institution holding the shares
      table.string('new_institution', 500).notNullable() // New institution receiving the shares

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(
        'investment_asset_sefbfr_id',
        'investment_asset_sefbfr_transfers_investment_asset_sefbfr_id_index',
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
