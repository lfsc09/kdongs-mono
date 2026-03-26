import { en, Faker, pt_BR } from '@faker-js/faker'
import { test } from '@japa/runner'
import { acceptedCurrencyCodes } from '@kdongs-mono/domain/types/investment/currency-code'
import { v7 as uuidv7 } from 'uuid'
import { storeValidator } from '#validators/investment/wallet'

test.group('[store] user wallet (validator)', () => {
  const faker = new Faker({
    locale: [pt_BR, en],
  })

  test('should validate with all required fields')
    .with([
      {
        currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
        name: faker.finance.accountName(),
        userId: uuidv7(),
      },
    ])
    .run(async ({ assert }, input) => {
      const output = await storeValidator.validate(input)
      assert.isDefined(output)
      assert.property(output, 'userId')
      assert.equal(output.userId, input.userId)
      assert.equal(output.name, input.name)
      assert.equal(output.currencyCode, input.currencyCode)
    })

  test('should fail [missing userId]').run(({ assert }) => {
    const input = {
      currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
      name: faker.finance.accountName(),
    }
    assert.rejects(() => storeValidator.validate(input))
  })

  test('should fail [missing name]').run(({ assert }) => {
    const input = {
      currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
      userId: uuidv7(),
    }
    assert.rejects(() => storeValidator.validate(input))
  })

  test('should fail [missing currencyCode]').run(({ assert }) => {
    const input = { name: faker.finance.accountName(), userId: uuidv7() }
    assert.rejects(() => storeValidator.validate(input))
  })

  test("should fail [invalid userId]['{$self}']")
    .with(['invalid-uuid'])
    .run(({ assert }, userId) => {
      const input = {
        currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
        name: faker.finance.accountName(),
        userId,
      }
      assert.rejects(() => storeValidator.validate(input))
    })

  test("should fail [invalid name]['{$self}']")
    .with(['', 'a'.repeat(256), 1])
    .run(({ assert }, name) => {
      const input = {
        currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes),
        name,
        userId: uuidv7(),
      }
      assert.rejects(() => storeValidator.validate(input))
    })

  test("should fail [invalid currencyCode]['{$self}']")
    .with(['', ' ', 'USA', 1, -1])
    .run(({ assert }, currencyCode) => {
      const input = { currencyCode, name: faker.finance.accountName(), userId: uuidv7() }
      assert.rejects(() => storeValidator.validate(input))
    })
})
