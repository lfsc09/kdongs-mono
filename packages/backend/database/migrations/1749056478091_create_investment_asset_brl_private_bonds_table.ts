import { BaseSchema } from '@adonisjs/lucid/schema'
import {
  acceptedBondTypes,
  acceptedIndexTypes,
  acceptedInterestTypes,
} from '@kdongs-mono/domain/types/investment/brl-private-bond'

export default class extends BaseSchema {
  protected tableName = 'investment_asset_brl_private_bonds'

  async up() {
    this.schema.createTable(this.tableName, table => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('wallet_id')
        .notNullable()
        .references('id')
        .inTable('investment_wallets')
        .onDelete('CASCADE')

      // Indicates if the bond investment is completed
      table.boolean('is_done').notNullable().defaultTo(false)
      // Institution where the bond is held
      table.string('holder_institution', 500).notNullable()
      // Institution that issued the bond
      table.string('emitter_institution', 500).notNullable()
      // Name of the bond
      table.string('bond_name').notNullable()
      // Type of the bond
      table.string('bond_type').notNullable().checkIn(acceptedBondTypes)
      // Type of interest
      table.string('interest_type').notNullable().checkIn(acceptedInterestTypes)
      // Index type
      table.string('index_type').notNullable().checkIn(acceptedIndexTypes)
      // Value of the index
      table.decimal('index_value', 20, 6).notNullable()
      // Maturity date of the bond in UTC
      table.datetime('maturity_date_utc').notNullable()
      // Date when the bond was acquired in UTC
      table.datetime('enter_date_utc').notNullable()
      // Date when the bond was sold or ended in UTC
      table.datetime('exit_date_utc').nullable()
      // Amount invested in the bond (only positive)
      table.decimal('input_amount', 20, 6).notNullable().checkPositive()
      // Gross amount of the bond
      table.decimal('gross_amount', 20, 6).nullable()
      // Fees associated with the bond investment (e.g., brokerage fees, IOF, etc.) (only negative)
      table.decimal('fees', 20, 6).nullable().checkNegative()
      // Other taxes applied to the bond (only negative)
      table.decimal('taxes', 20, 6).nullable().checkNegative()
      // Additional details about the bond
      table.text('details').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index('wallet_id', 'investment_asset_brl_private_bonds_wallet_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
