import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user/user'
import { UserRole } from '../../app/core/types/user/user_role.js'

export default class extends BaseSeeder {
  async run() {
    await User.query().delete()

    await UserFactory.merge([
      { email: 'admin@gmail.com', password: '12345678', role: UserRole.ADMIN },
      { email: 'user@gmail.com', password: '12345678', role: UserRole.USER },
    ]).createMany(2)
  }
}
