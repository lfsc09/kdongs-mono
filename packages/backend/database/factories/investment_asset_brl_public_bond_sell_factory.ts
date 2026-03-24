import factory from '@adonisjs/lucid/factories'
import type { Faker } from '@faker-js/faker'
import { type BondType, BondTypes } from '@kdongs-mono/domain/types/investment/brl-public-bond'
import Big from 'big.js'
import { DateTime } from 'luxon'
import AssetBrlPublicBondSell from '#models/investment/asset_brl_public_bond_sell'

const getFees = (
  bondType: BondType | undefined,
  unitPrice: Big,
  sharesAmount: Big,
  faker: Faker,
) => {
  switch (bondType) {
    case BondTypes.ltn:
      return unitPrice.times(sharesAmount).times(0.003).abs().neg() // Usually around 0.6% of (unit price * shares amount) (Buy + Sell)
    case BondTypes.lft:
      return unitPrice.times(sharesAmount).times(0.0019).abs().neg() // Usually around 0.38% of (unit price * shares amount) (Buy + Sell)
    default:
      return unitPrice
        .times(sharesAmount)
        .times(new Big(faker.number.float({ fractionDigits: 4, max: 0.003, min: 0.0019 }))) // Fees around 0.38% to 0.6% of (unit price * shares amount) (Buy + Sell)
        .abs()
        .neg()
  }
}

// Taxes around 15% to 22% of (unit price * shares amount * 0.38), where (0.38) would be an average yield rate
const getTaxes = (unitPrice: Big, sharesAmount: Big, faker: Faker) =>
  unitPrice
    .times(sharesAmount)
    .times(0.38)
    .times(new Big(faker.number.float({ fractionDigits: 4, max: 0.22, min: 0.15 })))
    .abs()
    .neg()

export const AssetBrlPublicBondSellFactory = factory
  .define(AssetBrlPublicBondSell, async ({ faker }) => {
    const dateUtc = DateTime.fromJSDate(faker.date.past({ years: 3 }))
    const unitPrice = new Big(faker.number.float({ fractionDigits: 2, max: 20000.0, min: 100.0 }))
    const sharesAmount = new Big(faker.number.float({ fractionDigits: 0, max: 30, min: 1 }))

    return {
      createdAt: dateUtc,
      dateUtc,
      details: faker.lorem.sentence(),
      fees: getFees(undefined, unitPrice, sharesAmount, faker),
      sharesAmount: sharesAmount.neg(),
      taxes: getTaxes(unitPrice, sharesAmount, faker),
      unitPrice,
    }
  })
  .state('asRandomLTN', (b, ctx) => {
    // LTNs are usually bought in larger amounts
    const sharesAmount = new Big(ctx.faker.number.float({ fractionDigits: 2, max: 40, min: 1 }))
    b.unitPrice = new Big(ctx.faker.number.float({ fractionDigits: 2, max: 900.0, min: 300.0 }))
    b.fees = getFees(BondTypes.ltn, b.unitPrice, sharesAmount, ctx.faker)
    b.taxes = getTaxes(b.unitPrice, sharesAmount, ctx.faker)
    b.sharesAmount = sharesAmount.neg()
    b.createdAt = b.dateUtc
  })
  .state('asRandomLFT', (b, ctx) => {
    // LFTs are usually bought in smaller amounts
    const sharesAmount = new Big(ctx.faker.number.float({ fractionDigits: 4, max: 4, min: 0.009 }))
    b.unitPrice = new Big(ctx.faker.number.float({ fractionDigits: 2, max: 20000.0, min: 10000.0 }))
    b.fees = getFees(BondTypes.lft, b.unitPrice, sharesAmount, ctx.faker)
    b.taxes = getTaxes(b.unitPrice, sharesAmount, ctx.faker)
    b.sharesAmount = sharesAmount.neg()
    b.createdAt = b.dateUtc
  })
  .state('recalculate', (b, ctx) => {
    b.fees = getFees(undefined, b.unitPrice, b.sharesAmount, ctx.faker)
    b.taxes = getTaxes(b.unitPrice, b.sharesAmount, ctx.faker)
    b.createdAt = b.dateUtc
  })
  .build()
