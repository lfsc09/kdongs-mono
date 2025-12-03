import { test } from '@japa/runner'
import { v7 as uuidv7 } from 'uuid'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user/user'
import type { UserRole } from '../../../../app/core/types/user/user_roles.js'

test.group('Update a user wallet', group => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  group.teardown(async () => {
    await User.query().delete()
  })

  /**
   * ACCESS TESTS
   */
  test('should not be able to update user wallet [no token]', async ({ client, expect }) => {
    const output = await client.patch(`/investments/wallets/${uuidv7()}`)
    expect(output.status()).toBe(401)
  })

  test("should be able to update user wallet [accepted '{$self}' role token]")
    .with(['user', 'admin'])
    .run(async ({ client, expect }, userRole) => {
      const user = await UserFactory.merge({ role: userRole as unknown as UserRole }).create()
      const wallet = await WalletFactory.merge({ userId: user.id }).create()
      const output = await client
        .patch(`/investments/wallets/${wallet.id}`)
        .json({ name: 'Updated Wallet Name' })
        .withGuard('api')
        .loginAs(user)
      expect(output.status()).toBe(200)
    })

  test("should not be able to update another user's wallets [not owner]", async ({
    client,
    expect,
  }) => {
    // Create a user with a wallet and another user to test access
    const user = await UserFactory.create()
    const userOwner = await UserFactory.create()
    const wallet = await WalletFactory.merge({ userId: userOwner.id }).create()
    const output = await client
      .patch(`/investments/wallets/${wallet.id}`)
      .json({ name: 'Updated Wallet Name' })
      .withGuard('api')
      .loginAs(user)
    expect(output.status()).toBe(404)
  })

  /**
   * REQUEST BODY TEST
   */
  test('should not be able to update user wallet [invalid request data]', async ({
    client,
    expect,
  }) => {
    const user = await UserFactory.create()
    const wallet = await WalletFactory.merge({ userId: user.id }).create()
    const output = await client
      .patch(`/investments/wallets/${wallet.id}`)
      .json({ name: 12 })
      .withGuard('api')
      .loginAs(user)
    expect(output.status()).toBe(422)
  })

  /**
   * RETURN TEST
   */
  test('should be able to update own wallet [owner of wallet]', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const wallet = await WalletFactory.merge({ userId: user.id }).create()
    const output = await client
      .patch(`/investments/wallets/${wallet.id}`)
      .json({ name: 'Updated Wallet Name' })
      .withGuard('api')
      .loginAs(user)
    expect(output.status()).toBe(200)
  })
})
