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
    .run(async ({ expect }, input) => {
      const output = await paginationValidator.validate(input)
      expect(output).toBeDefined()
      expect(output.page).toBe(input.page)
      expect(output.limit).toBe(input.limit)
      if (input.sortBy === undefined || input.sortBy === null) {
        expect(output.sortBy).toBeUndefined()
      } else {
        expect(output.sortBy).toBe(input.sortBy)
      }
      if (input.sortOrder === undefined || input.sortOrder === null) {
        expect(output.sortOrder).toBeUndefined()
      } else {
        expect(output.sortOrder).toBe(input.sortOrder)
      }
    })

  test("should fail [invalid page]['{$self}']")
    .with([undefined, null, -1, 0, '', ' ', 'a'])
    .run(({ expect }, page) => {
      const input = {
        limit: faker.number.int({ max: 100, min: 1 }),
        page,
        sortBy: 'colName',
        sortOrder: 'asc',
      }
      expect(() => paginationValidator.validate(input)).rejects.toThrow()
    })

  test("should fail [invalid limit]['{$self}']")
    .with([undefined, null, -1, 0, '', ' ', 'a'])
    .run(({ expect }, limit) => {
      const input = {
        limit,
        page: faker.number.int({ min: 1 }),
        sortBy: 'colName',
        sortOrder: 'asc',
      }
      expect(() => paginationValidator.validate(input)).rejects.toThrow()
    })

  test("should fail [invalid sortBy]['{$self}']")
    .with([[-1, 0, '']])
    .run(({ expect }, sortBy) => {
      const input = {
        limit: faker.number.int({ max: 100, min: 1 }),
        page: faker.number.int({ min: 1 }),
        sortBy,
        sortOrder: 'asc',
      }
      expect(() => paginationValidator.validate(input)).rejects.toThrow()
    })

  test("should fail [invalid sortOrder]['{$self}']")
    .with([[-1, 0, '', 'something']])
    .run(({ expect }, sortOrder) => {
      const input = {
        limit: faker.number.int({ max: 100, min: 1 }),
        page: faker.number.int({ min: 1 }),
        sortBy: 'colName',
        sortOrder,
      }
      expect(() => paginationValidator.validate(input)).rejects.toThrow()
    })
})
