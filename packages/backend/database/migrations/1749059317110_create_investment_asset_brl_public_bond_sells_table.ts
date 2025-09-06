import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'investment_asset_brl_public_bond_sells';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable();
      table
        .uuid('investment_asset_brl_public_bond_id')
        .notNullable()
        .references('id')
        .inTable('investment_asset_brl_public_bonds')
        .onDelete('CASCADE');

      table.datetime('date_utc').notNullable(); // Date in UTC of the sell transaction
      table.decimal('unit_price', 20, 6).notNullable(); // Price per unit at the time of the sell
      table.decimal('shares_amount', 20, 6).notNullable(); // Amount of shares sold
      table.decimal('taxes', 20, 6).nullable(); // Taxes associated with the sell transaction
      table.decimal('fees', 20, 6).nullable(); // Fees associated with the sell transaction (e.g., brokerage fees, IOF, etc.)
      table.text('details').nullable(); // Additional details about the sell transaction

      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();

      table.index(
        'investment_asset_brl_public_bond_id',
        'investment_asset_brl_public_bond_sells_investment_asset_brl_public_bond_id_index',
      );
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
