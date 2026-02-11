import { test } from '@japa/runner'
import { v7 as uuidv7 } from 'uuid'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user/user'
import type { UserRole } from '../../../../app/core/types/user/user_role.js'

test.group('Delete a user wallet', group => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  group.teardown(async () => {
    await User.query().delete()
  })

  /**
   * ACCESS TESTS
   */
  test('should not be able to delete user wallet [no token]', async ({ client, expect }) => {
    const output = await client.delete(`/investments/wallets/${uuidv7()}`)
    expect(output.status()).toBe(401)
  })

  test("should be able to delete user wallet [accepted '{$self}' role token]")
    .with(['user', 'admin'])
    .run(async ({ client, expect }, userRole) => {
      const user = await UserFactory.merge({ role: userRole as unknown as UserRole }).create()
      const wallet = await WalletFactory.merge({ userId: user.id }).create()
      const output = await client
        .delete(`/investments/wallets/${wallet.id}`)
        .withGuard('api')
        .loginAs(user)
      expect(output.status()).toBe(204)
    })

  test("should not be able to delete another user's wallets [not owner]", async ({
    client,
    expect,
  }) => {
    // Create a user with a wallet and another user to test access
    const user = await UserFactory.merge({ role: 'user' as unknown as UserRole }).create()
    const userOwner = await UserFactory.create()
    const wallet = await WalletFactory.merge({ userId: userOwner.id }).create()
    const output = await client
      .delete(`/investments/wallets/${wallet.id}`)
      .withGuard('api')
      .loginAs(user)
    expect(output.status()).toBe(404)
  })

  /**
   * RETURN TEST
   */
  test('should be able to delete own wallet [owner of wallet]', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const wallet = await WalletFactory.merge({ userId: user.id }).create()
    const output = await client
      .delete(`/investments/wallets/${wallet.id}`)
      .withGuard('api')
      .loginAs(user)
    expect(output.status()).toBe(204)
  })
})
