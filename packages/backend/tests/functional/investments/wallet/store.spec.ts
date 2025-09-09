import { test } from '@japa/runner';
import { WalletFactory } from '#database/factories/investment_wallet_factory';
import { UserFactory } from '#database/factories/user_factory';
import User from '#models/user/user';
import type { UserRole } from '../../../../app/core/types/user/user_roles.js';

test.group('Create a user wallet', (group) => {
  group.each.setup(async () => {
    await User.query().delete();
  });

  group.teardown(async () => {
    await User.query().delete();
  });

  /**
   * ACCESS TESTS
   */
  test('should not be able to create user wallet [no token]', async ({ client, expect }) => {
    const output = await client.post('/investments/wallets/');
    expect(output.status()).toBe(401);
  });

  test("should be able to create user wallet [accepted '{$self}' role token]")
    .with(['user', 'admin'])
    .run(async ({ client, expect }, userRole) => {
      const user = await UserFactory.merge({ role: userRole as unknown as UserRole }).create();
      const input = await WalletFactory.makeStubbed();
      const output = await client
        .post('/investments/wallets')
        .json(input.toJSON())
        .withGuard('api')
        .loginAs(user);
      expect(output.status()).toBe(201);
    });

  /**
   * REQUEST BODY TEST
   */
  test('should not be able to create user wallet [invalid request data]', async ({
    client,
    expect,
  }) => {
    const user = await UserFactory.create();
    const input = await WalletFactory.makeStubbed();
    input.name = '';
    const output = await client
      .post('/investments/wallets')
      .json(input.toJSON())
      .withGuard('api')
      .loginAs(user);
    expect(output.status()).toBe(422);
  });
});
