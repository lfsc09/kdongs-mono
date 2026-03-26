import { en, Faker, pt_BR } from '@faker-js/faker'
import { test } from '@japa/runner'
import { acceptedCurrencyCodes } from '@kdongs-mono/domain/types/investment/currency-code'
import { v7 as uuidv7 } from 'uuid'
import { updateValidator } from '#validators/investment/wallet'

test.group('[update] user wallet (validator)', () => {
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
    .run(async ({ assert }, input) => {
      const output = await updateValidator.validate(input)
      assert.isDefined(output)
      assert.property(output, 'userId')
      assert.equal(output.userId, input.userId)
      assert.equal(output.walletId, input.walletId)
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
    .run(async ({ assert }, input) => {
      const output = await updateValidator.validate(input)
      assert.isDefined(output)
      assert.property(output, 'userId')
      assert.equal(output.userId, input.userId)
      assert.equal(output.walletId, input.walletId)
    })

  test('should fail [missing userId]').run(({ assert }) => {
    const input = { walletId: uuidv7() }
    assert.rejects(() => updateValidator.validate(input))
  })

  test('should fail [missing walletId]').run(({ assert }) => {
    const input = { userId: uuidv7() }
    assert.rejects(() => updateValidator.validate(input))
  })

  test("should fail [invalid userId]['{$self}']")
    .with(['invalid-uuid'])
    .run(({ assert }, userId) => {
      const input = { userId, walletId: uuidv7() }
      assert.rejects(() => updateValidator.validate(input))
    })

  test("should fail [invalid walletId]['{$self}']")
    .with(['invalid-uuid'])
    .run(({ assert }, walletId) => {
      const input = { userId: uuidv7(), walletId }
      assert.rejects(() => updateValidator.validate(input))
    })

  test("should fail [invalid name]['{$self}']")
    .with(['', 'a'.repeat(256), 1])
    .run(({ assert }, name) => {
      const input = { name, userId: uuidv7(), walletId: uuidv7() }
      assert.rejects(() => updateValidator.validate(input))
    })

  test("should fail [invalid currencyCode]['{$self}']")
    .with(['', ' ', 'USA', 1, -1])
    .run(({ assert }, currencyCode) => {
      const input = { currencyCode, userId: uuidv7(), walletId: uuidv7() }
      assert.rejects(() => updateValidator.validate(input))
    })
})
