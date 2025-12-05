import { test } from '@japa/runner'
import { v7 as uuidv7 } from 'uuid'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user/user'
import type { UserRole } from '../../../../app/core/types/user/user_roles.js'

test.group('Get a user wallet', group => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  group.teardown(async () => {
    await User.query().delete()
  })

  /**
   * ACCESS TESTS
   */
  test('should not be able to get user wallet [no token]', async ({ client, expect }) => {
    const output = await client.get(`/investments/wallets/${uuidv7()}`)
    expect(output.status()).toBe(401)
  })

  test("should be able to get user wallet [accepted '{$self}' role token]")
    .with(['user', 'admin'])
    .run(async ({ client, expect }, userRole) => {
      const user = await UserFactory.merge({ role: userRole as unknown as UserRole }).create()
      const wallet = await WalletFactory.merge({ userId: user.id }).create()
      const output = await client
        .get(`/investments/wallets/${wallet.id}`)
        .withGuard('api')
        .loginAs(user)
      expect(output.status()).toBe(200)
    })

  test("should not be able to get another user's wallets [not owner]", async ({
    client,
    expect,
  }) => {
    // Create a user with a wallet and another user to test access
    const user = await UserFactory.create()
    const userOwner = await UserFactory.create()
    const wallet = await WalletFactory.merge({ userId: userOwner.id }).create()

    const output = await client
      .get(`/investments/wallets/${wallet.id}`)
      .withGuard('api')
      .loginAs(user)
    expect(output.status()).toBe(404)
  })

  /**
   * RETURN TESTS
   */
  test("should get wallet's data", async ({ client, expect }) => {
    const user = await UserFactory.create()
    const wallet = await WalletFactory.merge({ userId: user.id }).create()

    const output = await client
      .get(`/investments/wallets/${wallet.id}`)
      .withGuard('api')
      .loginAs(user)
    expect(output.status()).toBe(200)
    const body = output.body()
    expect(body).toHaveProperty('data')
    expect(body.data).toStrictEqual(expect.objectContaining({ walletId: expect.any(String) }))
  })
})
