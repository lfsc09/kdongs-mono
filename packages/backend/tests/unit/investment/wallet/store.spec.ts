import { en, Faker, pt_BR } from '@faker-js/faker';
import { test } from '@japa/runner';
import { v7 as uuidv7 } from 'uuid';
import { storeWalletValidator } from '#validators/investment/wallet/store';
import { acceptedCurrencyCodes } from '../../../../app/core/types/investment/currencies.js';

test.group('Create a user wallet validator', () => {
  const faker = new Faker({
    locale: [pt_BR, en],
  });

  test('should validate with all required fields')
    .with([
      {
        userId: uuidv7(),
        name: faker.finance.accountName(),
        currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
      },
    ])
    .run(async ({ expect }, input) => {
      const output = await storeWalletValidator.validate(input);
      expect(output.userId).toBe(input.userId);
      expect(output.name).toBe(input.name);
      expect(output.currencyCode).toBe(input.currencyCode);
    });

  test('should fail [missing userId]').run(({ expect }) => {
    const input = {
      name: faker.finance.accountName(),
      currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
    };
    expect(() => storeWalletValidator.validate(input)).rejects.toThrow();
  });

  test('should fail [missing name]').run(({ expect }) => {
    const input = {
      userId: uuidv7(),
      currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
    };
    expect(() => storeWalletValidator.validate(input)).rejects.toThrow();
  });

  test('should fail [missing currencyCode]').run(({ expect }) => {
    const input = { userId: uuidv7(), name: faker.finance.accountName() };
    expect(() => storeWalletValidator.validate(input)).rejects.toThrow();
  });

  test("should fail [invalid userId]['{$self}']")
    .with(['invalid-uuid'])
    .run(({ expect }, userId) => {
      const input = {
        userId,
        name: faker.finance.accountName(),
        currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
      };
      expect(() => storeWalletValidator.validate(input)).rejects.toThrow();
    });

  test("should fail [invalid name]['{$self}']")
    .with(['', 'a'.repeat(256), 1])
    .run(({ expect }, name) => {
      const input = {
        userId: uuidv7(),
        name,
        currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
      };
      expect(() => storeWalletValidator.validate(input)).rejects.toThrow();
    });

  test("should fail [invalid currencyCode]['{$self}']")
    .with(['', ' ', 'USA', 1, -1])
    .run(({ expect }, currencyCode) => {
      const input = { userId: uuidv7(), name: faker.finance.accountName(), currencyCode };
      expect(() => storeWalletValidator.validate(input)).rejects.toThrow();
    });
});
