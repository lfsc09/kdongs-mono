import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { UserRoles } from '@kdongs-mono/domain/types/user/user-role'
import { v7 as uuidv7 } from 'uuid'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import { UserFactory } from '#database/factories/user_factory'
import { userTokenAbilities } from '#services/user/helpers/user'

test.group('[show] user wallet', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  /**
   * ACCESS TESTS
   */
  test('should not be able to get user wallet [no token]', async ({ client }) => {
    const output = await client.get(`investments/wallets/${uuidv7()}`)
    output.assertStatus(401)
  })

  test("should be able to get user wallet [accepted '{$self}' role token]")
    .with([UserRoles.admin, UserRoles.user, UserRoles.visitor])
    .run(async ({ client }, role) => {
      const user = await UserFactory.merge({ role }).create()
      const wallet = await WalletFactory.merge({ userId: user.id }).create()
      const output = await client
        .get(`investments/wallets/${wallet.id}`)
        .withGuard('api')
        .loginAs(user, userTokenAbilities(role))
      output.assertStatus(200)
    })

  test("should not be able to get another user's wallets [not owner]", async ({ client }) => {
    // Create a user with a wallet and another user to test access
    const user = await UserFactory.create()
    const userOwner = await UserFactory.create()
    const wallet = await WalletFactory.merge({ userId: userOwner.id }).create()
    const output = await client
      .get(`investments/wallets/${wallet.id}`)
      .withGuard('api')
      .loginAs(user)
    output.assertStatus(404)
  })

  /**
   * RETURN TESTS
   */
  test("should get wallet's data", async ({ client, assert }) => {
    const user = await UserFactory.create()
    const wallet = await WalletFactory.merge({ userId: user.id }).create()
    const output = await client
      .get(`investments/wallets/${wallet.id}`)
      .withGuard('api')
      .loginAs(user)
    output.assertStatus(200)
    const body = output.body()
    assert.property(body, 'data')
    assert.onlyProperties(body.data, ['walletId'])
  })
})
