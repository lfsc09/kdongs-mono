import { en, Faker, pt_BR } from '@faker-js/faker';
import { test } from '@japa/runner';
import { paginationValidator } from '#validators/shared/pagination';

test.group('Pagination validator', () => {
  const faker = new Faker({
    locale: [pt_BR, en],
  });

  test('should validate with all valid fields')
    .with([
      {
        page: faker.number.int({ min: 1 }),
        limit: faker.number.int({ min: 1, max: 100 }),
        sortBy: undefined,
        sortOrder: undefined,
      },
      {
        page: faker.number.int({ min: 1 }),
        limit: faker.number.int({ min: 1, max: 100 }),
        sortBy: null,
        sortOrder: null,
      },
      {
        page: faker.number.int({ min: 1 }),
        limit: faker.number.int({ min: 1, max: 100 }),
        sortBy: 'colName',
        sortOrder: 'asc',
      },
      {
        page: faker.number.int({ min: 1 }),
        limit: faker.number.int({ min: 1, max: 100 }),
        sortBy: 'colName',
        sortOrder: 'desc',
      },
    ])
    .run(async ({ expect }, input) => {
      const output = await paginationValidator.validate(input);
      expect(output).toBeDefined();
      expect(output.page).toBe(input.page);
      expect(output.limit).toBe(input.limit);
      expect(output.sortBy).toBe(input.sortBy);
      expect(output.sortOrder).toBe(input.sortOrder);
    });

  test("should fail [invalid page]['{$self}']")
    .with([undefined, null, -1, 0, '', ' ', 'a'])
    .run(({ expect }, page) => {
      const input = {
        page,
        limit: faker.number.int({ min: 1, max: 100 }),
        sortBy: 'colName',
        sortOrder: 'asc',
      };
      expect(() => paginationValidator.validate(input)).rejects.toThrow();
    });

  test("should fail [invalid limit]['{$self}']")
    .with([undefined, null, -1, 0, '', ' ', 'a'])
    .run(({ expect }, limit) => {
      const input = {
        page: faker.number.int({ min: 1 }),
        limit,
        sortBy: 'colName',
        sortOrder: 'asc',
      };
      expect(() => paginationValidator.validate(input)).rejects.toThrow();
    });

  test("should fail [invalid sortBy]['{$self}']")
    .with([[-1, 0, '']])
    .run(({ expect }, sortBy) => {
      const input = {
        page: faker.number.int({ min: 1 }),
        limit: faker.number.int({ min: 1, max: 100 }),
        sortBy,
        sortOrder: 'asc',
      };
      expect(() => paginationValidator.validate(input)).rejects.toThrow();
    });

  test("should fail [invalid sortOrder]['{$self}']")
    .with([[-1, 0, '', 'something']])
    .run(({ expect }, sortOrder) => {
      const input = {
        page: faker.number.int({ min: 1 }),
        limit: faker.number.int({ min: 1, max: 100 }),
        sortBy: 'colName',
        sortOrder,
      };
      expect(() => paginationValidator.validate(input)).rejects.toThrow();
    });
});
