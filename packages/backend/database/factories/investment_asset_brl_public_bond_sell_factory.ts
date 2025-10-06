import factory from '@adonisjs/lucid/factories';
import type { Faker } from '@faker-js/faker';
import Big from 'big.js';
import { DateTime } from 'luxon';
import AssetBrlPublicBondSell from '#models/investment/asset_brl_public_bond_sell';
import type { BondType } from '../../app/core/types/investment/brl_public_bonds.js';

const getFees = (
  bondType: BondType | undefined,
  unitPrice: Big,
  sharesAmount: Big,
  faker: Faker,
) => {
  switch (bondType) {
    case 'LTN':
      return unitPrice.times(sharesAmount).times(0.003); // Usually around 0.6% of (unit price * shares amount) (Buy + Sell)
    case 'LFT':
      return unitPrice.times(sharesAmount).times(0.0019); // Usually around 0.38% of (unit price * shares amount) (Buy + Sell)
    default:
      return unitPrice
        .times(sharesAmount)
        .times(new Big(faker.number.float({ min: 0.0019, max: 0.003, fractionDigits: 4 }))); // Fees around 0.38% to 0.6% of (unit price * shares amount) (Buy + Sell)
  }
};

// Taxes around 15% to 22% of (unit price * shares amount * 0.38), where (0.38) would be an average yield rate
const getTaxes = (unitPrice: Big, sharesAmount: Big, faker: Faker) =>
  unitPrice
    .times(sharesAmount)
    .times(0.33)
    .times(new Big(faker.number.float({ min: 0.15, max: 0.22, fractionDigits: 4 })));

export const AssetBrlPublicBondSellFactory = factory
  .define(AssetBrlPublicBondSell, async ({ faker }) => {
    const dateUtc = DateTime.fromJSDate(faker.date.past({ years: 3 }));
    const unitPrice = new Big(faker.number.float({ min: 100.0, max: 20000.0, fractionDigits: 2 }));
    const sharesAmount = new Big(faker.number.float({ min: 1, max: 30, fractionDigits: 0 }));

    return {
      dateUtc,
      unitPrice,
      sharesAmount,
      fees: getFees(undefined, unitPrice, sharesAmount, faker),
      taxes: getTaxes(unitPrice, sharesAmount, faker),
      details: faker.lorem.sentence(),
      createdAt: dateUtc,
    };
  })
  .state('asRandomLTN', (b, ctx) => {
    b.unitPrice = new Big(ctx.faker.number.float({ min: 300.0, max: 900.0, fractionDigits: 2 }));
    b.sharesAmount = new Big(ctx.faker.number.float({ min: 1, max: 40, fractionDigits: 2 })); // LTNs are usually bought in larger amounts
    b.fees = getFees('LTN', b.unitPrice, b.sharesAmount, ctx.faker);
    b.taxes = getTaxes(b.unitPrice, b.sharesAmount, ctx.faker);
    b.createdAt = b.dateUtc;
  })
  .state('asRandomLFT', (b, ctx) => {
    b.unitPrice = new Big(
      ctx.faker.number.float({ min: 10000.0, max: 20000.0, fractionDigits: 2 }),
    );
    b.sharesAmount = new Big(ctx.faker.number.float({ min: 0.009, max: 4, fractionDigits: 4 })); // LFTs are usually bought in smaller amounts
    b.fees = getFees('LFT', b.unitPrice, b.sharesAmount, ctx.faker);
    b.taxes = getTaxes(b.unitPrice, b.sharesAmount, ctx.faker);
    b.createdAt = b.dateUtc;
  })
  .state('recalculate', (b, ctx) => {
    b.fees = getFees(undefined, b.unitPrice, b.sharesAmount, ctx.faker);
    b.taxes = getTaxes(b.unitPrice, b.sharesAmount, ctx.faker);
    b.createdAt = b.dateUtc;
  })
  .build();
