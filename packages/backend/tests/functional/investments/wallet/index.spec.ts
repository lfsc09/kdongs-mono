import { test } from '@japa/runner'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user/user'
import { IndexWalletsResponse } from '../../../../app/core/dto/investment/wallet/index_dto.js'
import type { UserRole } from '../../../../app/core/types/user/user_roles.js'

test.group('List user wallets', group => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  group.teardown(async () => {
    await User.query().delete()
  })

  /**
   * ACCESS TESTS
   */
  test('should not be able to list wallets [no token]', async ({ client, expect }) => {
    const output = await client.get('/investments/wallets')
    expect(output.status()).toBe(401)
  })

  test("should be able to list wallets [accepted '{$self}' role token]")
    .with(['user', 'admin'])
    .run(async ({ client, expect }, userRole) => {
      const user = await UserFactory.merge({ role: userRole as unknown as UserRole }).create()
      const output = await client
        .get('/investments/wallets')
        .qs({ limit: 10, page: 1 })
        .withGuard('api')
        .loginAs(user)
      expect(output.status()).toBe(200)
    })

  /**
   * REQUEST QUERY STRINGS TEST
   */
  test('should not list wallets [invalid query string data]', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const output = await client
      .get('/investments/wallets')
      .qs({ limit: 10, page: 0 })
      .withGuard('api')
      .loginAs(user)
    expect(output.status()).toBe(422)
  })

  test('should not list wallets with no query string data', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const output = await client.get('/investments/wallets').withGuard('api').loginAs(user)
    expect(output.status()).toBe(422)
  })

  /**
   * RETURN TESTS
   */
  test('should list zero wallets [no data to show]', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const output = await client
      .get('/investments/wallets')
      .qs({ limit: 10, page: 1 })
      .withGuard('api')
      .loginAs(user)
    expect(output.status()).toBe(200)
    const body: IndexWalletsResponse = output.body()
    expect(body).toHaveProperty('data')
    expect(body.data).toHaveProperty('wallets')
    expect(body.data.wallets).toHaveLength(0)
    expect(body).toHaveProperty('metadata')
    expect(body.metadata).toStrictEqual(
      expect.objectContaining({
        limit: 10,
        page: 1,
        totalCount: 0,
        totalPages: 1,
      }),
    )
  })

  test('should have the correct fields when listing wallets', async ({ client, expect }) => {
    const user = await UserFactory.create()
    await WalletFactory.merge({ userId: user.id }).create()
    const output = await client
      .get('/investments/wallets')
      .qs({ limit: 10, page: 1 })
      .withGuard('api')
      .loginAs(user)
    expect(output.status()).toBe(200)
    const body: IndexWalletsResponse = output.body()
    expect(body).toHaveProperty('data')
    expect(body.data).toHaveProperty('wallets')
    expect(body.data.wallets).toHaveLength(1)
    expect(body.data.wallets[0]).toStrictEqual(
      expect.objectContaining({
        createdAt: expect.any(String),
        currencyCode: expect.any(String),
        currentBalance: expect.any(Number),
        id: expect.any(String),
        initialBalance: expect.any(Number),
        name: expect.any(String),
        profitInCurncy: expect.any(Number),
        profitInPerc: expect.any(Number),
        trend: expect.any(String),
        updatedAt: expect.any(String),
      }),
    )
    expect(body).toHaveProperty('metadata')
    expect(body.metadata).toStrictEqual(
      expect.objectContaining({
        limit: 10,
        page: 1,
        totalCount: 1,
        totalPages: 1,
      }),
    )
  })
})
