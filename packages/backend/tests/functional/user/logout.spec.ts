import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'

test.group('[logout] user', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('should sucessfully logout user [with cookie]', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'password' }).create()
    const loginOutput = await client.post('login').json({
      email: user.email,
      password: 'password',
    })

    loginOutput.assertStatus(200)
    loginOutput.assertCookie('token')

    const logoutOutput = await client
      .delete('logout')
      .withEncryptedCookie('token', loginOutput.cookie('token')?.value)

    logoutOutput.assertStatus(204)
    logoutOutput.assertCookie('token', null)
  })

  test('should sucessfully logout user [with bearer token]', async ({ client }) => {
    const user = await UserFactory.merge({ password: 'password' }).create()
    const loginOutput = await client.post('login').json({
      email: user.email,
      password: 'password',
    })

    loginOutput.assertStatus(200)
    loginOutput.assertCookie('token')

    const logoutOutput = await client
      .delete('logout')
      .header('Authorization', `Bearer ${loginOutput.cookie('token')?.value}`)

    logoutOutput.assertStatus(204)
    logoutOutput.assertCookie('token', null)
  })
})
