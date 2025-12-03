import { BaseSchema } from '@adonisjs/lucid/schema'
import {
  acceptedBondTypes,
  acceptedIndexTypes,
  acceptedInterestTypes,
} from '../../app/core/types/investment/brl_public_bonds.js'

export default class extends BaseSchema {
  protected tableName = 'investment_asset_brl_public_bonds'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('wallet_id')
        .notNullable()
        .references('id')
        .inTable('investment_wallets')
        .onDelete('CASCADE')

      table.boolean('is_done').notNullable().defaultTo(false) // Indicates if the bond is completed
      table.string('holder_institution', 500).notNullable() // Institution holding the bond
      table.string('bond_name').notNullable() // Name of the public bond investment
      table.string('bond_type').notNullable().checkIn(acceptedBondTypes) // Type of index
      table.string('interest_type').notNullable().checkIn(acceptedInterestTypes) // Type of interest
      table.string('index_type').notNullable().checkIn(acceptedIndexTypes) // Type of index
      table.datetime('maturity_date_utc').notNullable() // Maturity date of the bond

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index('wallet_id', 'investment_asset_brl_public_bonds_wallet_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
