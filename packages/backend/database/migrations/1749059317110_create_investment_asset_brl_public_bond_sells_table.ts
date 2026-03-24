import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'investment_asset_brl_public_bond_sells'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('investment_asset_brl_public_bond_id')
        .notNullable()
        .references('id')
        .inTable('investment_asset_brl_public_bonds')
        .onDelete('CASCADE')

      // Date in UTC of the sell transaction
      table.datetime('date_utc').notNullable()
      // Price per unit at the time of the sell (only positive)
      table.decimal('unit_price', 20, 6).notNullable().checkPositive()
      // Amount of shares sold in this transaction (only negative)
      table.decimal('shares_amount', 20, 6).notNullable().checkNegative()
      // Taxes associated with the sell transaction (only negative)
      table.decimal('taxes', 20, 6).nullable().checkNegative()
      // Fees associated with the sell transaction (only negative)
      table.decimal('fees', 20, 6).nullable().checkNegative()
      // Additional details about the sell transaction
      table.text('details').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(
        'investment_asset_brl_public_bond_id',
        'investment_asset_brl_public_bond_sells_investment_asset_brl_public_bond_id_index',
      )
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
