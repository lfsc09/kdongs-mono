import { BaseSeeder } from '@adonisjs/lucid/seeders';
import { UserFactory } from '#database/factories/user_factory';
import User from '#models/user/user';

export default class extends BaseSeeder {
  async run() {
    await User.query().delete();

    await UserFactory.merge([
      { email: 'admin@gmail.com', password: '12345678', role: 'admin' },
      { email: 'user@gmail.com', password: '12345678', role: 'user' },
    ]).createMany(2);
  }
}
