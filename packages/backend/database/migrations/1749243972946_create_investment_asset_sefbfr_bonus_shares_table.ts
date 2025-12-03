import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'investment_asset_sefbfr_bonus_shares'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('investment_asset_sefbfr_id')
        .notNullable()
        .references('id')
        .inTable('investment_asset_sefbfrs')
        .onDelete('CASCADE')

      table.datetime('date_utc').notNullable() // Date of the SEFBFR bonus shares transaction
      table.decimal('value', 20, 6).notNullable() // Value of the bonus shares received
      table.decimal('factor', 20, 6).notNullable() // Factor by which the shares are increased

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(
        'investment_asset_sefbfr_id',
        'investment_asset_sefbfr_bonus_shares_investment_asset_sefbfr_id_index',
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
