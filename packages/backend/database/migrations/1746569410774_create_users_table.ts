import { BaseSchema } from '@adonisjs/lucid/schema';
import { acceptedUserRoles } from '../../contracts/model/user/user_roles.js';

export default class extends BaseSchema {
  protected tableName = 'users';

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable();

      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.string('role').notNullable().defaultTo('user').checkIn(acceptedUserRoles);

      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();
      table.timestamp('deleted_at').nullable();
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
