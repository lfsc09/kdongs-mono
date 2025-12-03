import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user/user'

test.group('Login user', group => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  group.teardown(async () => {
    await User.query().delete()
  })

  test('should sucessfully login user', async ({ client, expect }) => {
    const user = await UserFactory.merge({ password: '12345678' }).create()
    const input = {
      email: user.email,
      password: '12345678',
    }
    const output = await client.post('/login').json(input)
    expect(output.status()).toBe(200)
  })

  test('should fail to login user [invalid email field]', async ({ client, expect }) => {
    const input = {
      email: 'invalid@',
      password: 'invalidpassword',
    }
    const output = await client.post('/login').json(input)
    expect(output.status()).toBe(422)
  })

  test('should fail to login user with [invalid credentials]', async ({ client, expect }) => {
    const input = {
      email: 'invalid@email.com',
      password: 'invalidpassword',
    }
    const output = await client.post('/login').json(input)
    expect(output.status()).toBe(400)
  })
})
