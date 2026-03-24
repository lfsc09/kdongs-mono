import { BaseSchema } from '@adonisjs/lucid/schema'
import {
  acceptedBondTypes,
  acceptedIndexTypes,
  acceptedInterestTypes,
} from '@kdongs-mono/domain/types/investment/brl-public-bond'

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

      // Indicates if the bond is completed
      table.boolean('is_done').notNullable().defaultTo(false)
      // Institution holding the bond
      table.string('holder_institution', 500).notNullable()
      // Name of the public bond investment
      table.string('bond_name').notNullable()
      // Type of the bond
      table.string('bond_type').notNullable().checkIn(acceptedBondTypes)
      // Type of interest
      table.string('interest_type').notNullable().checkIn(acceptedInterestTypes)
      // Type of index
      table.string('index_type').notNullable().checkIn(acceptedIndexTypes)
      // Maturity date of the bond
      table.datetime('maturity_date_utc').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index('wallet_id', 'investment_asset_brl_public_bonds_wallet_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
