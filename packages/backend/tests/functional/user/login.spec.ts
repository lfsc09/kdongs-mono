import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'

test.group('Login user', group => {
  group.each.setup(() => testUtils.db().truncate())

  test('should sucessfully login user', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'password' }).create()
    const output = await client.post('login').json({
      email: user.email,
      password: 'password',
    })
    output.assertStatus(200)
    output.assertCookie('token')
    assert.property(output.body(), 'data')
    assert.onlyProperties(output.body().data, ['allowedIn', 'tokenExp', 'userEmail', 'userName'])
  })

  test('should fail to login user [invalid email value]', async ({ client }) => {
    const output = await client.post('login').json({
      email: 'invalid@',
      password: 'invalidpassword',
    })
    output.assertStatus(422)
  })

  test('should fail to login user with [wrong password]', async ({ client }) => {
    const output = await client.post('login').json({
      email: 'invalid@email.com',
      password: 'invalidpassword',
    })
    output.assertStatus(400)
  })
})
