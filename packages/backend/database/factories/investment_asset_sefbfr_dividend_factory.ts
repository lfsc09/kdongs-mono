import factory from '@adonisjs/lucid/factories'
import type { Faker } from '@faker-js/faker'
import Big from 'big.js'
import { DateTime } from 'luxon'
import AssetSefbfrDividend from '#models/investment/asset_sefbfr_dividend'

// Taxes around 15% to 22% of value
const getTaxes = (value: Big, faker: Faker) => {
  return value
    .times(new Big(faker.number.float({ fractionDigits: 4, max: 0.22, min: 0.15 })))
    .abs()
    .neg()
}

export const AssetSefbfrDividendFactory = factory
  .define(AssetSefbfrDividend, async ({ faker }) => {
    const dateUtc = DateTime.fromJSDate(faker.date.past({ years: 3 }))
    const value = new Big(faker.number.float({ fractionDigits: 2, max: 100.0, min: 0.1 }))

    return {
      createdAt: dateUtc,
      dateComUtc: dateUtc.plus({ days: faker.number.int({ max: 5, min: 1 }) }),
      datePaymentUtc: dateUtc.plus({ days: faker.number.int({ max: 30, min: 6 }) }),
      dateUtc,
      taxes: getTaxes(value, faker),
      value,
    }
  })
  .state('recalculate', b => {
    b.createdAt = b.dateUtc
  })
  .build()
