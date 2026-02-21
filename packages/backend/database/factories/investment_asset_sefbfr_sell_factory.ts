import factory from '@adonisjs/lucid/factories'
import type { Faker } from '@faker-js/faker'
import Big from 'big.js'
import { DateTime } from 'luxon'
import AssetSefbfrSell from '#models/investment/asset_sefbfr_sell'

const getFees = (priceQuote: Big, sharesAmount: Big, faker: Faker) => {
  return priceQuote
    .times(sharesAmount)
    .times(new Big(faker.number.float({ fractionDigits: 4, max: 0.003, min: 0.0019 }))) // Fees around 0.38% to 0.6% of (price quote * shares amount) (Buy + Sell)
    .abs()
    .neg()
}

// Taxes around 15% to 22% of (price quote * shares amount * 0.38), where (0.38) would be an average yield rate
const getTaxes = (priceQuote: Big, sharesAmount: Big, faker: Faker) =>
  priceQuote
    .times(sharesAmount)
    .times(0.38)
    .times(new Big(faker.number.float({ fractionDigits: 4, max: 0.22, min: 0.15 })))
    .abs()
    .neg()

export const AssetSefbfrSellFactory = factory
  .define(AssetSefbfrSell, async ({ faker }) => {
    const dateUtc = DateTime.fromJSDate(faker.date.past({ years: 3 }))
    const priceQuote = new Big(faker.number.float({ fractionDigits: 2, max: 100.0, min: 0.1 }))
    const sharesAmount = new Big(faker.number.float({ fractionDigits: 0, max: 10000, min: 1 }))

    return {
      createdAt: dateUtc,
      dateUtc,
      details: faker.lorem.sentence(),
      fees: getFees(priceQuote, sharesAmount, faker),
      priceQuote,
      sharesAmount,
      taxes: getTaxes(priceQuote, sharesAmount, faker),
    }
  })
  .state('recalculate', (b, ctx) => {
    b.fees = getFees(b.priceQuote, b.sharesAmount, ctx.faker)
    b.taxes = getTaxes(b.priceQuote, b.sharesAmount, ctx.faker)
    b.createdAt = b.dateUtc
  })
  .build()
