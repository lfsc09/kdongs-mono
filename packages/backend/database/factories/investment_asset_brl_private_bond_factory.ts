import factory from '@adonisjs/lucid/factories';
import type { Faker } from '@faker-js/faker';
import Big from 'big.js';
import { DateTime } from 'luxon';
import AssetBrlPrivateBond from '#models/investment/asset_brl_private_bond';
import {
  acceptedBondTypes,
  acceptedIndexTypes,
  acceptedInterestTypes,
  type BondType,
  type InterestType,
} from '../../contracts/model/investment/brl_private_bonds.js';

const BUSINESS_DAYS_PER_YEAR = 252;
const CALENDAR_DAYS_PER_YEAR = 365;

const getDailyFixedPerformance = (annualRate: Big, isBusinessDays: boolean = true): Big => {
  const days_per_year = isBusinessDays ? BUSINESS_DAYS_PER_YEAR : CALENDAR_DAYS_PER_YEAR;
  return new Big(annualRate.plus(1).toNumber() ** (1 / days_per_year)).minus(1);
};

const getDailyVariablePerformance = (
  bondRateOfCdi: Big,
  cdiRate: Big,
  isBusinessDays: boolean = true,
): Big => {
  const days_per_year = isBusinessDays ? BUSINESS_DAYS_PER_YEAR : CALENDAR_DAYS_PER_YEAR;
  return new Big(bondRateOfCdi.times(cdiRate).plus(1).toNumber() ** (1 / days_per_year)).minus(1);
};

const calculateFutureValue = (inputAmount: Big, dailyRate: Big, bondYieldDays: number): Big => {
  return inputAmount.times(dailyRate.plus(1).pow(bondYieldDays));
};

const getTaxFee = (bondYieldDays: number): Big => {
  if (bondYieldDays <= 180)
    return new Big(0.225); // 22.5% for bonds held less than 180 days
  else if (bondYieldDays <= 360)
    return new Big(0.2); // 20% for bonds held between 180 and 360 days
  else if (bondYieldDays <= 720)
    return new Big(0.175); // 17.5% for bonds held between 360 and 720 days
  else return new Big(0.15); // 15% for bonds held more than 720 days
};

const getIofFee = (bondYieldDays: number): Big => {
  switch (bondYieldDays) {
    case 1:
      return new Big(0.96);
    case 2:
      return new Big(0.93);
    case 3:
      return new Big(0.9);
    case 4:
      return new Big(0.86);
    case 5:
      return new Big(0.83);
    case 6:
      return new Big(0.8);
    case 7:
      return new Big(0.76);
    case 8:
      return new Big(0.73);
    case 9:
      return new Big(0.7);
    case 10:
      return new Big(0.66);
    case 11:
      return new Big(0.63);
    case 12:
      return new Big(0.6);
    case 13:
      return new Big(0.56);
    case 14:
      return new Big(0.53);
    case 15:
      return new Big(0.5);
    case 16:
      return new Big(0.46);
    case 17:
      return new Big(0.43);
    case 18:
      return new Big(0.4);
    case 19:
      return new Big(0.36);
    case 20:
      return new Big(0.33);
    case 21:
      return new Big(0.3);
    case 22:
      return new Big(0.26);
    case 23:
      return new Big(0.33);
    case 24:
      return new Big(0.2);
    case 25:
      return new Big(0.16);
    case 26:
      return new Big(0.13);
    case 27:
      return new Big(0.1);
    case 28:
      return new Big(0.06);
    case 29:
      return new Big(0.03);
    default:
      return new Big(0);
  }
};

const getEnterDateUtc = (maturityDateUtc: Date, faker: Faker): Date => {
  const enterDateUtcRange = {
    from: DateTime.fromJSDate(maturityDateUtc).minus({ years: 1 }),
    to: DateTime.fromJSDate(maturityDateUtc).minus({ days: 1 }),
  };
  return faker.date.between({
    from: enterDateUtcRange.from.toJSDate(),
    to: enterDateUtcRange.to.diffNow().isValid
      ? enterDateUtcRange.to.toJSDate()
      : DateTime.now().toJSDate(),
  });
};

const regularBondGenerator = (
  isDone: boolean,
  bondType: BondType,
  interestType: InterestType,
  maturityDateUtc: Date,
  enterDateUtc: Date,
  inputAmount: Big,
  faker: Faker,
) => {
  const indexType =
    interestType === 'fixed'
      ? acceptedIndexTypes.filter((v) => v === 'a.a%').at(0)
      : acceptedIndexTypes.filter((v) => v === '% of cdi').at(0);
  if (!indexType) {
    throw new Error(`No valid index type found`);
  }
  const indexValue =
    interestType === 'fixed'
      ? new Big(faker.number.float({ min: 0.01, max: 0.15, fractionDigits: 2 }))
      : new Big(faker.number.float({ min: 0.95, max: 1.2, fractionDigits: 2 }));

  const bondYieldDays = Math.round(
    DateTime.fromJSDate(maturityDateUtc).diff(DateTime.fromJSDate(enterDateUtc), 'days').days,
  );

  let grossAmount = null;
  let yieldAmount = null;
  let iofAmount = null;
  let taxesAmount = null;
  if (isDone) {
    const dailyRate =
      interestType === 'fixed'
        ? getDailyFixedPerformance(indexValue, true)
        : getDailyVariablePerformance(
            indexValue,
            new Big(faker.number.float({ min: 0.05, max: 0.15, fractionDigits: 2 })),
            true,
          );
    grossAmount = calculateFutureValue(inputAmount, dailyRate, bondYieldDays);
    yieldAmount = grossAmount.minus(inputAmount);
    iofAmount = yieldAmount.times(getIofFee(bondYieldDays));
    // Taxes are applied only for certain bond types
    if (acceptedBondTypes.filter<BondType>((v) => v === 'LCA' || v === 'LCI').includes(bondType)) {
      taxesAmount = yieldAmount.minus(iofAmount).times(getTaxFee(bondYieldDays));
    }
  }

  return {
    indexType,
    indexValue,
    exitDateUtc: isDone ? DateTime.fromJSDate(maturityDateUtc) : null,
    grossAmount,
    fees: iofAmount,
    taxes: taxesAmount,
    createdAt: DateTime.fromJSDate(faker.date.soon({ days: 10, refDate: enterDateUtc })),
  };
};

export const AssetBrlPrivateBondFactory = factory
  .define(AssetBrlPrivateBond, async ({ faker }) => {
    const isDone = faker.datatype.boolean(0.6);
    const bondType = faker.helpers.arrayElement(acceptedBondTypes as BondType[]);
    const interestType = faker.helpers.arrayElement(acceptedInterestTypes as InterestType[]);
    // Generate maturity dates from 1 year in the past to 1 year in the future
    const maturityDateUtc = isDone
      ? faker.date.recent({ days: faker.number.int({ min: 30, max: 365 }) })
      : faker.date.soon({ days: faker.number.int({ min: 30, max: 365 }) });
    const enterDateUtc = getEnterDateUtc(maturityDateUtc, faker);
    const inputAmount = new Big(faker.number.float({ min: 1000, max: 200000, fractionDigits: 2 }));

    const bondData = regularBondGenerator(
      isDone,
      bondType,
      interestType,
      maturityDateUtc,
      enterDateUtc,
      inputAmount,
      faker,
    );

    return {
      isDone,
      holderInstitution: faker.company.name(),
      emitterInstitution: faker.company.name(),
      bondName: faker.finance.accountName(),
      bondType,
      interestType,
      maturityDateUtc: DateTime.fromJSDate(maturityDateUtc),
      enterDateUtc: DateTime.fromJSDate(enterDateUtc),
      inputAmount,
      details: faker.lorem.sentence(),
      ...bondData,
    };
  })
  .state('asDone', (b, ctx) => {
    b.isDone = true;
    const maturityDateUtc = ctx.faker.date.recent({
      days: ctx.faker.number.int({ min: 30, max: 365 }),
    });
    b.maturityDateUtc = DateTime.fromJSDate(maturityDateUtc);
    b.enterDateUtc = DateTime.fromJSDate(getEnterDateUtc(maturityDateUtc, ctx.faker));
    b.merge({
      ...regularBondGenerator(
        true,
        b.bondType,
        b.interestType,
        b.maturityDateUtc.toJSDate(),
        b.enterDateUtc.toJSDate(),
        b.inputAmount,
        ctx.faker,
      ),
    });
  })
  .state('asNotDone', (b, ctx) => {
    b.isDone = false;
    const maturityDateUtc = ctx.faker.date.soon({
      days: ctx.faker.number.int({ min: 30, max: 365 }),
    });
    b.maturityDateUtc = DateTime.fromJSDate(maturityDateUtc);
    b.enterDateUtc = DateTime.fromJSDate(getEnterDateUtc(maturityDateUtc, ctx.faker));
    b.merge({
      ...regularBondGenerator(
        true,
        b.bondType,
        b.interestType,
        b.maturityDateUtc.toJSDate(),
        b.enterDateUtc.toJSDate(),
        b.inputAmount,
        ctx.faker,
      ),
    });
  })
  .state('recalculate', (b, ctx) => {
    b.merge({
      ...regularBondGenerator(
        b.isDone,
        b.bondType,
        b.interestType,
        b.maturityDateUtc.toJSDate(),
        b.enterDateUtc.toJSDate(),
        b.inputAmount,
        ctx.faker,
      ),
    });
  })
  .build();
