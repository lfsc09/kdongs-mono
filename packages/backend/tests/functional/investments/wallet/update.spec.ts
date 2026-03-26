import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { UserRoles } from '@kdongs-mono/domain/types/user/user-role'
import { v7 as uuidv7 } from 'uuid'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import { UserFactory } from '#database/factories/user_factory'
import { userTokenAbilities } from '#services/user/helpers/user'

test.group('[update] user wallet', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  /**
   * ACCESS TESTS
   */
  test('should not be able to update user wallet [no token]', async ({ client }) => {
    const output = await client.patch(`investments/wallets/${uuidv7()}`)
    output.assertStatus(401)
  })

  test("should not be able to update user wallet [unaccepted '{$self}' role token]")
    .with([UserRoles.visitor])
    .run(async ({ client }, role) => {
      const user = await UserFactory.merge({ role }).create()
      const wallet = await WalletFactory.merge({ userId: user.id }).create()
      const output = await client
        .patch(`investments/wallets/${wallet.id}`)
        .json({ name: 'Updated Wallet Name' })
        .withGuard('api')
        .loginAs(user, userTokenAbilities(role))
      output.assertStatus(403)
    })

  test("should be able to update user wallet [accepted '{$self}' role token]")
    .with([UserRoles.admin, UserRoles.user])
    .run(async ({ client }, role) => {
      const user = await UserFactory.merge({ role }).create()
      const wallet = await WalletFactory.merge({ userId: user.id }).create()
      const output = await client
        .patch(`investments/wallets/${wallet.id}`)
        .json({ name: 'Updated Wallet Name' })
        .withGuard('api')
        .loginAs(user, userTokenAbilities(role))
      output.assertStatus(200)
    })

  test("should not be able to update another user's wallets [not owner]", async ({ client }) => {
    // Create a user with a wallet and another user to test access
    const user = await UserFactory.merge({ role: UserRoles.user }).create()
    const userOwner = await UserFactory.merge({ role: UserRoles.user }).create()
    const wallet = await WalletFactory.merge({ userId: userOwner.id }).create()
    const output = await client
      .patch(`investments/wallets/${wallet.id}`)
      .json({ name: 'Updated Wallet Name' })
      .withGuard('api')
      .loginAs(user, userTokenAbilities(user.role))
    output.assertStatus(404)
  })

  /**
   * REQUEST BODY TEST
   */
  test('should not be able to update user wallet [invalid request data]', async ({ client }) => {
    const user = await UserFactory.merge({ role: UserRoles.user }).create()
    const wallet = await WalletFactory.merge({ userId: user.id }).create()
    const output = await client
      .patch(`investments/wallets/${wallet.id}`)
      .json({ name: 12 })
      .withGuard('api')
      .loginAs(user, userTokenAbilities(user.role))
    output.assertStatus(422)
  })
})
