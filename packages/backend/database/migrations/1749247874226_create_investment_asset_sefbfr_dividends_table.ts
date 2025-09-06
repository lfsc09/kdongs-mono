import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'investment_asset_sefbfr_dividends';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable();
      table
        .uuid('investment_asset_sefbfr_id')
        .notNullable()
        .references('id')
        .inTable('investment_asset_sefbfrs')
        .onDelete('CASCADE');

      table.datetime('date_utc').notNullable(); // Date of the SEFBFR dividend transaction
      table.decimal('value', 20, 6).notNullable(); // Value of the dividend received
      table.decimal('taxes', 20, 6).nullable(); // Taxes associated with the dividend transaction
      table.datetime('date_com_utc').nullable(); // Date of the dividend transaction in the company's records
      table.datetime('date_payment_utc').nullable(); // Date when the dividend was paid
      table.text('details').nullable(); // Additional details about the dividend transaction

      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();

      table.index(
        'investment_asset_sefbfr_id',
        'investment_asset_sefbfr_dividends_investment_asset_sefbfr_id_index',
      );
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
