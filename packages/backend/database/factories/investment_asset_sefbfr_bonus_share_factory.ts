import factory from '@adonisjs/lucid/factories'
import Big from 'big.js'
import { DateTime } from 'luxon'
import AssetSefbfrBonusShare from '#models/investment/asset_sefbfr_bonus_share'

export const AssetSefbfrBonusShareFactory = factory
  .define(AssetSefbfrBonusShare, async ({ faker }) => {
    const dateUtc = DateTime.fromJSDate(faker.date.past({ years: 3 }))
    const value = new Big(faker.number.float({ fractionDigits: 2, max: 100.0, min: 0.1 }))
    const factor = new Big(faker.number.float({ fractionDigits: 2, max: 1.0, min: 0.1 }))

    return {
      createdAt: dateUtc,
      dateUtc,
      factor,
      value,
    }
  })
  .state('recalculate', b => {
    b.createdAt = b.dateUtc
  })
  .build()
