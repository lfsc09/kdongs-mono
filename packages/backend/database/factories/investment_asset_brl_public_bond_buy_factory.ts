import factory from '@adonisjs/lucid/factories'
import type { Faker } from '@faker-js/faker'
import Big from 'big.js'
import { DateTime } from 'luxon'
import AssetBrlPublicBondBuy from '#models/investment/asset_brl_public_bond_buy'
import type { BondType } from '../../app/core/types/investment/brl_public_bonds.js'

const getFees = (
  bondType: BondType | undefined,
  unitPrice: Big,
  sharesAmount: Big,
  faker: Faker,
) => {
  switch (bondType) {
    case 'LTN':
      return unitPrice.times(sharesAmount).times(0.003) // Usually around 0.6% of (unit price * shares amount) (Buy + Sell)
    case 'LFT':
      return unitPrice.times(sharesAmount).times(0.0019) // Usually around 0.38% of (unit price * shares amount) (Buy + Sell)
    default:
      return unitPrice
        .times(sharesAmount)
        .times(new Big(faker.number.float({ fractionDigits: 4, max: 0.003, min: 0.0019 }))) // Fees around 0.38% to 0.6% of (unit price * shares amount) (Buy + Sell)
  }
}

export const AssetBrlPublicBondBuyFactory = factory
  .define(AssetBrlPublicBondBuy, async ({ faker }) => {
    const dateUtc = DateTime.fromJSDate(faker.date.past({ years: 3 }))
    const unitPrice = new Big(faker.number.float({ fractionDigits: 2, max: 20000.0, min: 100.0 }))
    const sharesAmount = new Big(faker.number.float({ fractionDigits: 0, max: 30, min: 1 }))

    return {
      createdAt: dateUtc,
      dateUtc,
      details: faker.lorem.sentence(),
      fees: getFees(undefined, unitPrice, sharesAmount, faker),
      indexValue: new Big(faker.number.float({ fractionDigits: 2, max: 0.5, min: 0.01 })),
      sharesAmount,
      unitPrice,
    }
  })
  .state('asRandomLTN', (b, ctx) => {
    b.indexValue = new Big(ctx.faker.number.float({ fractionDigits: 2, max: 0.15, min: 0.01 }))
    b.unitPrice = new Big(ctx.faker.number.float({ fractionDigits: 2, max: 900.0, min: 300.0 }))
    b.sharesAmount = new Big(ctx.faker.number.float({ fractionDigits: 2, max: 40, min: 1 })) // LTNs are usually bought in larger amounts
    b.fees = getFees('LTN', b.unitPrice, b.sharesAmount, ctx.faker)
    b.createdAt = b.dateUtc
  })
  .state('asRandomLFT', (b, ctx) => {
    b.indexValue = new Big(ctx.faker.number.float({ fractionDigits: 4, max: 0.01, min: 0.0001 }))
    b.unitPrice = new Big(ctx.faker.number.float({ fractionDigits: 2, max: 20000.0, min: 10000.0 }))
    b.sharesAmount = new Big(ctx.faker.number.float({ fractionDigits: 4, max: 4, min: 0.009 })) // LFTs are usually bought in smaller amounts
    b.fees = getFees('LFT', b.unitPrice, b.sharesAmount, ctx.faker)
    b.createdAt = b.dateUtc
  })
  .state('recalculate', (b, ctx) => {
    b.fees = getFees(undefined, b.unitPrice, b.sharesAmount, ctx.faker)
    b.createdAt = b.dateUtc
  })
  .build()
