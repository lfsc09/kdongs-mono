import { BaseSchema } from '@adonisjs/lucid/schema';
import { acceptedCurrencyCodes } from '../../app/core/types/investment/currencies.js';

export default class extends BaseSchema {
  protected tableName = 'investment_wallet_movements';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable();
      table
        .uuid('wallet_id')
        .notNullable()
        .references('id')
        .inTable('investment_wallets')
        .onDelete('CASCADE');

      table.string('movement_type').notNullable().checkIn(['deposit', 'withdraw']); // e.g., 'deposit', 'withdrawal'
      table.datetime('date_utc').notNullable(); // Date of the movement
      table.string('institution').nullable(); // Institution where the movement occurred
      table.string('origin_currency_code', 3).notNullable().checkIn(acceptedCurrencyCodes); // Currency code of the movement origin
      table.decimal('origin_amount', 20, 6).notNullable(); // Amount in the origin currency
      table.decimal('origin_exch_gross_rate', 20, 6).nullable(); // Gross exchange rate to convert the origin currency
      table.decimal('origin_exch_op_fee', 20, 6).nullable(); // Exchange operation fee of the origin currency conversion (fee + iof)
      table.decimal('origin_exch_vet_rate', 20, 6).nullable(); // Final exchange rate to convert the origin currency
      table.string('result_currency_code', 3).notNullable().checkIn(acceptedCurrencyCodes); // Currency code to which the origin currency was converted
      table.decimal('result_amount', 20, 6).notNullable(); // Amount in the result currency
      table.text('details').nullable(); // Additional details about the movement

      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();

      table.index('wallet_id', 'investment_wallet_movements_wallet_id_index');
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
