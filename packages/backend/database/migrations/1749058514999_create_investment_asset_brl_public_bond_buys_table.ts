import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'investment_asset_brl_public_bond_buys';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable();
      table
        .uuid('investment_asset_brl_public_bond_id')
        .notNullable()
        .references('id')
        .inTable('investment_asset_brl_public_bonds')
        .onDelete('CASCADE');

      table.datetime('date_utc').notNullable(); // Date in UTC of the buy transaction
      table.decimal('index_value', 20, 6).notNullable(); // Value of the index at the time of the buy
      table.decimal('unit_price', 20, 6).notNullable(); // Price per unit at the time of the buy
      table.decimal('shares_amount', 20, 6).notNullable(); // Amount of shares bought
      table.decimal('fees', 20, 6).nullable(); // Fees associated with the buy transaction
      table.text('details').nullable(); // Additional details about the buy transaction

      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();

      table.index(
        'investment_asset_brl_public_bond_id',
        'investment_asset_brl_public_bond_buys_investment_asset_brl_public_bond_id_index',
      );
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
