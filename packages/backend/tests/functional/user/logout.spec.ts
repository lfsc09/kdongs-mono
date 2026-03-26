import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'

test.group('Logout user', group => {
  group.each.setup(() => testUtils.db().truncate())

  test('should sucessfully logout user', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'password' }).create()
    const loginOutput = await client.post('login').json({
      email: user.email,
      password: 'password',
    })

    const logoutOutput = await client
      .post('logout')
      .withEncryptedCookie('token', loginOutput.cookie('token')?.value)

    logoutOutput.assertStatus(204)
    logoutOutput.assertCookie('token', '')
  })

  test('should fail to logout user [auth cookie missing]', async ({ client }) => {
    const output = await client.post('logout')
    output.assertStatus(422)
  })
})
