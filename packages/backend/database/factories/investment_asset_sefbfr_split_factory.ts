import factory from '@adonisjs/lucid/factories'
import Big from 'big.js'
import { DateTime } from 'luxon'
import AssetSefbfrSplit from '#models/investment/asset_sefbfr_split'

export const AssetSefbfrSplitFactory = factory
  .define(AssetSefbfrSplit, async ({ faker }) => {
    const dateUtc = DateTime.fromJSDate(faker.date.past({ years: 3 }))
    const factor = new Big(faker.number.float({ fractionDigits: 2, max: 10.0, min: 1.1 }))

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
