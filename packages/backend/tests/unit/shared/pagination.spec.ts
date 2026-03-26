import { en, Faker, pt_BR } from '@faker-js/faker'
import { test } from '@japa/runner'
import { paginationValidator } from '#validators/shared/pagination'

test.group('Pagination validator', () => {
  const faker = new Faker({
    locale: [pt_BR, en],
  })

  test('should validate with all valid fields')
    .with([
      {
        limit: faker.number.int({ max: 100, min: 1 }),
        page: faker.number.int({ min: 1 }),
        sortBy: undefined,
        sortOrder: undefined,
      },
      {
        limit: faker.number.int({ max: 100, min: 1 }),
        page: faker.number.int({ min: 1 }),
        sortBy: null,
        sortOrder: null,
      },
      {
        limit: faker.number.int({ max: 100, min: 1 }),
        page: faker.number.int({ min: 1 }),
        sortBy: 'colName',
        sortOrder: 'asc',
      },
      {
        limit: faker.number.int({ max: 100, min: 1 }),
        page: faker.number.int({ min: 1 }),
        sortBy: 'colName',
        sortOrder: 'desc',
      },
    ])
    .run(async ({ assert }, input) => {
      const output = await paginationValidator.validate(input)
      assert.isDefined(output)
      assert.equal(output.page, input.page)
      assert.equal(output.limit, input.limit)
      if (input.sortBy === undefined || input.sortBy === null) {
        assert.isUndefined(output.sortBy)
      } else {
        assert.equal(output.sortBy, input.sortBy)
      }
      if (input.sortOrder === undefined || input.sortOrder === null) {
        assert.isUndefined(output.sortOrder)
      } else {
        assert.equal(output.sortOrder, input.sortOrder)
      }
    })

  test("should fail [invalid page]['{$self}']")
    .with([undefined, null, -1, 0, '', ' ', 'a'])
    .run(({ assert }, page) => {
      const input = {
        limit: faker.number.int({ max: 100, min: 1 }),
        page,
        sortBy: 'colName',
        sortOrder: 'asc',
      }
      assert.throws(() => paginationValidator.validate(input))
    })

  test("should fail [invalid limit]['{$self}']")
    .with([undefined, null, -1, 0, '', ' ', 'a'])
    .run(({ assert }, limit) => {
      const input = {
        limit,
        page: faker.number.int({ min: 1 }),
        sortBy: 'colName',
        sortOrder: 'asc',
      }
      assert.throws(() => paginationValidator.validate(input))
    })

  test("should fail [invalid sortBy]['{$self}']")
    .with([[-1, 0, '']])
    .run(({ assert }, sortBy) => {
      const input = {
        limit: faker.number.int({ max: 100, min: 1 }),
        page: faker.number.int({ min: 1 }),
        sortBy,
        sortOrder: 'asc',
      }
      assert.throws(() => paginationValidator.validate(input))
    })

  test("should fail [invalid sortOrder]['{$self}']")
    .with([[-1, 0, '', 'something']])
    .run(({ assert }, sortOrder) => {
      const input = {
        limit: faker.number.int({ max: 100, min: 1 }),
        page: faker.number.int({ min: 1 }),
        sortBy: 'colName',
        sortOrder,
      }
      assert.throws(() => paginationValidator.validate(input))
    })
})
