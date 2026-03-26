import factory from '@adonisjs/lucid/factories'
import { UserRole, UserRoles } from '@kdongs-mono/domain/types/user/user-role'
import User from '#models/user/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: faker.internet.email(),
      name: faker.internet.displayName(),
      password: faker.internet.password({ length: 8 }),
      role: faker.helpers.arrayElement(Object.values(UserRoles) as UserRole[]),
    }
  })
  .build()
