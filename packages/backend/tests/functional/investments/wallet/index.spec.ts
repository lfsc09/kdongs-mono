import { test } from '@japa/runner';
import { WalletFactory } from '#database/factories/investment_wallet_factory';
import { UserFactory } from '#database/factories/user_factory';
import User from '#models/user/user';
import type { UserRole } from '../../../../app/core/types/user/user_roles.js';

test.group('List user wallets', (group) => {
  group.each.setup(async () => {
    await User.query().delete();
  });

  group.teardown(async () => {
    await User.query().delete();
  });

  /**
   * ACCESS TESTS
   */
  test('should not be able to list wallets [no token]', async ({ client, expect }) => {
    const output = await client.get('/investments/wallets');
    expect(output.status()).toBe(401);
  });

  test("should be able to list wallets [accepted '{$self}' role token]")
    .with(['user', 'admin'])
    .run(async ({ client, expect }, userRole) => {
      const user = await UserFactory.merge({ role: userRole as unknown as UserRole }).create();
      const output = await client
        .get('/investments/wallets')
        .qs({ page: 1, limit: 10 })
        .withGuard('api')
        .loginAs(user);
      expect(output.status()).toBe(200);
    });

  /**
   * REQUEST QUERY STRINGS TEST
   */
  test('should not list wallets [invalid query string data]', async ({ client, expect }) => {
    const user = await UserFactory.create();
    const output = await client
      .get('/investments/wallets')
      .qs({ page: 0, limit: 10 })
      .withGuard('api')
      .loginAs(user);
    expect(output.status()).toBe(422);
  });

  test('should not list wallets with no query string data', async ({ client, expect }) => {
    const user = await UserFactory.create();
    const output = await client.get('/investments/wallets').withGuard('api').loginAs(user);
    expect(output.status()).toBe(422);
  });

  /**
   * RETURN TESTS
   */
  test('should list zero wallets [no data to show]', async ({ client, expect }) => {
    const user = await UserFactory.create();
    const output = await client
      .get('/investments/wallets')
      .qs({ page: 1, limit: 10 })
      .withGuard('api')
      .loginAs(user);
    expect(output.status()).toBe(200);
    const body = output.body();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('wallets');
    expect(body.data.wallets).toHaveLength(0);
    expect(body).toHaveProperty('metadata');
    expect(body.metadata).toHaveProperty('totalCount');
    expect(body.metadata).toHaveProperty('page');
    expect(body.metadata).toHaveProperty('limit');
    expect(body.metadata).toHaveProperty('totalPages');
  });

  test('should have the correct fields when listing wallets', async ({ client, expect }) => {
    const user = await UserFactory.create();
    await WalletFactory.merge({ userId: user.id }).create();
    const output = await client
      .get('/investments/wallets')
      .qs({ page: 1, limit: 10 })
      .withGuard('api')
      .loginAs(user);
    expect(output.status()).toBe(200);
    const body = output.body();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('wallets');
    expect(body.data.wallets).toHaveLength(1);
    expect(body.data.wallets.at(0)).toHaveProperty('id');
    expect(body.data.wallets.at(0)).toHaveProperty('name');
    expect(body.data.wallets.at(0)).toHaveProperty('currencyCode');
    expect(body.data.wallets.at(0)).toHaveProperty('trend');
    expect(body.data.wallets.at(0)).toHaveProperty('balance');
    expect(body.data.wallets.at(0)).toHaveProperty('createdAt');
    expect(body.data.wallets.at(0)).toHaveProperty('updatedAt');
    expect(body).toHaveProperty('metadata');
    expect(body.metadata).toHaveProperty('totalCount');
    expect(body.metadata.totalCount).toBe(1);
    expect(body.metadata).toHaveProperty('page');
    expect(body.metadata.page).toBe(1);
    expect(body.metadata).toHaveProperty('limit');
    expect(body.metadata.limit).toBe(10);
    expect(body.metadata).toHaveProperty('totalPages');
    expect(body.metadata.totalPages).toBe(1);
  });
});
