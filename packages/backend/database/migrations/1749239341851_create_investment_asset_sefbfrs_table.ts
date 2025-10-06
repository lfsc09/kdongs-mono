import { BaseSchema } from '@adonisjs/lucid/schema';
import { acceptedDoneStates } from '../../app/core/types/investment/sefbfr.js';

export default class extends BaseSchema {
  protected tableName = 'investment_asset_sefbfrs';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable();
      table
        .uuid('wallet_id')
        .notNullable()
        .references('id')
        .inTable('investment_wallets')
        .onDelete('CASCADE');

      table
        .string('done_state')
        .notNullable()
        .defaultTo(acceptedDoneStates.at(0) ?? null)
        .checkIn(acceptedDoneStates); // Indicates if the SEFBFR investment is completed
      table.string('holder_institution', 500).notNullable(); // Institution where the SEFBFR is held
      table.string('asset_name').notNullable(); // Name of the SEFBFR asset

      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();

      table.index('wallet_id', 'investment_asset_sefbfrs_wallet_id_index');
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
