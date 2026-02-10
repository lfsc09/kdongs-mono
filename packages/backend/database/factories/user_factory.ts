import factory from '@adonisjs/lucid/factories'
import User from '#models/user/user'
import { UserRole } from '../../app/core/types/user/user_role.js'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: faker.internet.email(),
      name: faker.internet.displayName(),
      password: faker.internet.password({ length: 8 }),
      role: faker.helpers.arrayElement(Object.values(UserRole) as UserRole[]),
    }
  })
  .state('admin', u => {
    u.role = UserRole.ADMIN
  })
  .build()
