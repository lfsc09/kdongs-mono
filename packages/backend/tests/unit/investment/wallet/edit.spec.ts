import { en, Faker, pt_BR } from '@faker-js/faker'
import { test } from '@japa/runner'
import { v7 as uuidv7 } from 'uuid'
import { editWalletValidator } from '#validators/investment/wallet/edit'
import { acceptedCurrencyCodes } from '../../../../app/core/types/investment/currencies.js'

test.group('Update a user wallet validator', () => {
  const faker = new Faker({
    locale: [pt_BR, en],
  })

  test('should validate with all required fields')
    .with([
      {
        userId: uuidv7(),
        walletId: uuidv7(),
      },
    ])
    .run(async ({ expect }, input) => {
      const output = await editWalletValidator.validate(input)
      expect(output).toBeDefined()
      expect(output).toHaveProperty('userId')
      expect(output.userId).toBe(input.userId)
      expect(output.walletId).toBe(input.walletId)
    })

  test('should validate with all valid fields')
    .with([
      {
        currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
        name: faker.finance.accountName(),
        userId: uuidv7(),
        walletId: uuidv7(),
      },
      {
        name: faker.finance.accountName(),
        userId: uuidv7(),
        walletId: uuidv7(),
      },
      {
        currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
        userId: uuidv7(),
        walletId: uuidv7(),
      },
    ])
    .run(async ({ expect }, input) => {
      const output = await editWalletValidator.validate(input)
      expect(output).toBeDefined()
      expect(output).toHaveProperty('userId')
      expect(output.userId).toBe(input.userId)
      expect(output.walletId).toBe(input.walletId)
    })

  test('should fail [missing userId]').run(({ expect }) => {
    const input = { walletId: uuidv7() }
    expect(() => editWalletValidator.validate(input)).rejects.toThrow()
  })

  test('should fail [missing walletId]').run(({ expect }) => {
    const input = { userId: uuidv7() }
    expect(() => editWalletValidator.validate(input)).rejects.toThrow()
  })

  test("should fail [invalid userId]['{$self}']")
    .with(['invalid-uuid'])
    .run(({ expect }, userId) => {
      const input = { userId, walletId: uuidv7() }
      expect(() => editWalletValidator.validate(input)).rejects.toThrow()
    })

  test("should fail [invalid walletId]['{$self}']")
    .with(['invalid-uuid'])
    .run(({ expect }, walletId) => {
      const input = { userId: uuidv7(), walletId }
      expect(() => editWalletValidator.validate(input)).rejects.toThrow()
    })

  test("should fail [invalid name]['{$self}']")
    .with(['', 'a'.repeat(256), 1])
    .run(({ expect }, name) => {
      const input = { name, userId: uuidv7(), walletId: uuidv7() }
      expect(() => editWalletValidator.validate(input)).rejects.toThrow()
    })

  test("should fail [invalid currencyCode]['{$self}']")
    .with(['', ' ', 'USA', 1, -1])
    .run(({ expect }, currencyCode) => {
      const input = { currencyCode, userId: uuidv7(), walletId: uuidv7() }
      expect(() => editWalletValidator.validate(input)).rejects.toThrow()
    })
})
