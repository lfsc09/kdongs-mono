import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserRoles } from '@kdongs-mono/domain/types/user/user-role'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user/user'

export default class extends BaseSeeder {
  async run() {
    await User.query().delete()

    await UserFactory.merge([
      { email: 'admin@gmail.com', password: '12345678', role: UserRoles.admin },
      { email: 'user@gmail.com', password: '12345678', role: UserRoles.user },
      { email: 'visitor@gmail.com', password: '12345678', role: UserRoles.visitor },
    ]).createMany(3)
  }
}
