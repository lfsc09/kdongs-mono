import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { UserRoles } from '@kdongs-mono/domain/types/user/user-role'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import { UserFactory } from '#database/factories/user_factory'
import { userTokenAbilities } from '#services/user/helpers/user'

test.group('[index] user wallets', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  /**
   * ACCESS TESTS
   */
  test('should not be able to list wallets [no token]', async ({ client }) => {
    const output = await client.get('investments/wallets')
    output.assertStatus(401)
  })

  test("should be able to list wallets [accepted '{$self}' role token]")
    .with([UserRoles.admin, UserRoles.user, UserRoles.visitor])
    .run(async ({ client }, role) => {
      const user = await UserFactory.merge({ role }).create()
      const output = await client
        .get('investments/wallets')
        .qs({ limit: 10, page: 1 })
        .withGuard('api')
        .loginAs(user, userTokenAbilities(role))
      output.assertStatus(200)
    })

  /**
   * REQUEST QUERY STRINGS TEST
   */
  test('should not list wallets [invalid query string data]', async ({ client }) => {
    const user = await UserFactory.create()
    const output = await client
      .get('investments/wallets')
      .qs({ limit: 10, page: 0 })
      .withGuard('api')
      .loginAs(user, userTokenAbilities(user.role))
    output.assertStatus(422)
  })

  test('should not list wallets [no query string data]', async ({ client }) => {
    const user = await UserFactory.create()
    const output = await client
      .get('investments/wallets')
      .withGuard('api')
      .loginAs(user, userTokenAbilities(user.role))
    output.assertStatus(422)
  })

  /**
   * RETURN TESTS
   */
  test('should list zero wallets [no data to show]', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const output = await client
      .get('investments/wallets')
      .qs({ limit: 10, page: 1 })
      .withGuard('api')
      .loginAs(user, userTokenAbilities(user.role))
    output.assertStatus(200)
    const body = output.body()
    assert.property(body, 'data')
    assert.property(body.data, 'wallets')
    assert.lengthOf(body.data.wallets, 0)
    assert.property(body, 'metadata')
    assert.onlyProperties(body.metadata, ['limit', 'page', 'totalCount', 'totalPages'])
  })

  test('should have the correct fields when listing wallets', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await WalletFactory.merge({ userId: user.id }).create()
    const output = await client
      .get('investments/wallets')
      .qs({ limit: 10, page: 1 })
      .withGuard('api')
      .loginAs(user, userTokenAbilities(user.role))
    output.assertStatus(200)
    const body = output.body()
    assert.property(body, 'metadata')
    assert.property(body, 'data')
    assert.onlyProperties(body.metadata, ['limit', 'page', 'totalCount', 'totalPages'])
    assert.property(body.data, 'wallets')
    assert.lengthOf(body.data.wallets, 1)
    assert.onlyProperties(body.data.wallets[0], [
      'id',
      'isActive',
      'name',
      'currencyCode',
      'trend',
      'initialBalance',
      'currentBalance',
      'profitInCurrency',
      'profitInPerc',
      'createdAt',
      'updatedAt',
    ])
  })
})
