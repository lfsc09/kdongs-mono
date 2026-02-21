import factory from '@adonisjs/lucid/factories'
import Big from 'big.js'
import { DateTime } from 'luxon'
import AssetSefbfrInplit from '#models/investment/asset_sefbfr_inplit'

export const AssetSefbfrInplitFactory = factory
  .define(AssetSefbfrInplit, async ({ faker }) => {
    const dateUtc = DateTime.fromJSDate(faker.date.past({ years: 3 }))
    const factor = new Big(faker.number.float({ fractionDigits: 2, max: 0.99, min: 0.1 }))

    return {
      createdAt: dateUtc,
      dateUtc,
      factor,
    }
  })
  .state('recalculate', b => {
    b.createdAt = b.dateUtc
  })
  .build()
