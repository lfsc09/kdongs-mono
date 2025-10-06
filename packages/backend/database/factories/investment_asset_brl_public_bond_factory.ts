import factory from '@adonisjs/lucid/factories';
import { DateTime } from 'luxon';
import AssetBrlPublicBond from '#models/investment/asset_brl_public_bond';
import {
  acceptedBondTypes,
  acceptedIndexTypes,
  acceptedInterestTypes,
  type InterestType,
} from '../../app/core/types/investment/brl_public_bonds.js';
import { AssetBrlPublicBondBuyFactory } from './investment_asset_brl_public_bond_buy_factory.js';
import { AssetBrlPublicBondSellFactory } from './investment_asset_brl_public_bond_sell_factory.js';

const regularBondGenerator = (interestType: InterestType) => {
  const indexType =
    interestType === 'fixed'
      ? acceptedIndexTypes.filter((v) => v === 'a.a%').at(0)
      : acceptedIndexTypes.filter((v) => v === 'selic + %').at(0);
  if (!indexType) {
    throw new Error(`No valid index type found`);
  }

  return {
    indexType,
  };
};

export const AssetBrlPublicBondFactory = factory
  .define(AssetBrlPublicBond, async ({ faker }) => {
    const isDone = faker.datatype.boolean(0.3);
    const interestType = faker.helpers.arrayElement(acceptedInterestTypes as InterestType[]);
    const bondType =
      interestType === 'fixed'
        ? acceptedBondTypes.filter((v) => v === 'LTN').at(0)
        : acceptedBondTypes.filter((v) => v === 'LFT').at(0);
    if (!bondType) {
      throw new Error(`No valid bond type found`);
    }
    const maturityDateUtc = isDone
      ? DateTime.fromSQL(`${faker.date.past({ years: 3 }).getUTCFullYear()}-01-01`)
      : DateTime.fromSQL(`${faker.date.future({ years: 7 }).getUTCFullYear()}-01-01`);

    const bondData = regularBondGenerator(interestType);

    return {
      isDone,
      holderInstitution: faker.company.name(),
      bondName: faker.finance.accountName(),
      bondType,
      interestType,
      maturityDateUtc,
      createdAt: DateTime.fromJSDate(faker.date.past({ years: 3 })),
      ...bondData,
    };
  })
  .state('asDone', (b, ctx) => {
    b.isDone = true;
    b.maturityDateUtc = DateTime.fromSQL(
      `${ctx.faker.date.past({ years: 3 }).getUTCFullYear()}-01-01`,
    );
    b.merge({
      ...regularBondGenerator(b.interestType),
    });
  })
  .state('asNotDone', (b, ctx) => {
    b.isDone = false;
    b.maturityDateUtc = DateTime.fromSQL(
      `${ctx.faker.date.future({ years: 7 }).getUTCFullYear()}-01-01`,
    );
    b.merge({
      ...regularBondGenerator(b.interestType),
    });
  })
  .state('recalculate', (b) => {
    b.merge({
      ...regularBondGenerator(b.interestType),
    });
  })
  .relation('assetBrlPublicBondBuys', () => AssetBrlPublicBondBuyFactory)
  .relation('assetBrlPublicBondSells', () => AssetBrlPublicBondSellFactory)
  .build();
