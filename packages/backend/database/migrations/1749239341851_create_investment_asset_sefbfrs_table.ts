import { BaseSchema } from '@adonisjs/lucid/schema'
import { acceptedDoneStates, DoneStates } from '@kdongs-mono/domain/types/investment/sefbfr'

export default class extends BaseSchema {
  protected tableName = 'investment_asset_sefbfrs'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('wallet_id')
        .notNullable()
        .references('id')
        .inTable('investment_wallets')
        .onDelete('CASCADE')

      // Indicates if the SEFBFR investment is completed
      table
        .string('done_state')
        .notNullable()
        .defaultTo(DoneStates.active)
        .checkIn(acceptedDoneStates)
      // Institution where the SEFBFR is held
      table.string('holder_institution', 500).notNullable()
      // Name of the SEFBFR asset
      table.string('asset_name').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index('wallet_id', 'investment_asset_sefbfrs_wallet_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
