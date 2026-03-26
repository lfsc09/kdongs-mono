import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { UserRoles } from '@kdongs-mono/domain/types/user/user-role'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import { UserFactory } from '#database/factories/user_factory'
import { userTokenAbilities } from '#services/user/helpers/user'

test.group('[store] user wallet', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  /**
   * ACCESS TESTS
   */
  test('should not be able to create user wallet [no token]', async ({ client }) => {
    const output = await client.post('investments/wallets')
    output.assertStatus(401)
  })

  test("should not be able to create user wallet [unaccepted '{$self}' role token]")
    .with([UserRoles.visitor])
    .run(async ({ client }, role) => {
      const user = await UserFactory.merge({ role }).create()
      const input = await WalletFactory.makeStubbed()
      const output = await client
        .post('investments/wallets')
        .json(input.toJSON())
        .withGuard('api')
        .loginAs(user, userTokenAbilities(role))
      output.assertStatus(403)
    })

  test("should be able to create user wallet [accepted '{$self}' role token]")
    .with([UserRoles.admin, UserRoles.user])
    .run(async ({ client }, role) => {
      const user = await UserFactory.merge({ role }).create()
      const input = await WalletFactory.makeStubbed()
      const output = await client
        .post('investments/wallets')
        .json(input.toJSON())
        .withGuard('api')
        .loginAs(user, userTokenAbilities(role))
      output.assertStatus(201)
    })

  /**
   * REQUEST BODY TEST
   */
  test('should not be able to create user wallet [invalid request data]', async ({ client }) => {
    const user = await UserFactory.merge({ role: UserRoles.user }).create()
    const input = await WalletFactory.makeStubbed()
    input.name = ''
    const output = await client
      .post('investments/wallets')
      .json(input.toJSON())
      .withGuard('api')
      .loginAs(user, userTokenAbilities(user.role))
    output.assertStatus(422)
  })
})
