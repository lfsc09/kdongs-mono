import factory from '@adonisjs/lucid/factories';
import type { Faker } from '@faker-js/faker';
import Big from 'big.js';
import { DateTime } from 'luxon';
import WalletMovement from '#models/investment/wallet_movement';
import {
  acceptedCurrencyCodes,
  type CurrencyCode,
} from '../../contracts/model/investment/currencies.js';

const movementGenerator = (
  type: 'deposit' | 'withdraw',
  originAmount: Big,
  originCurrencyCode: CurrencyCode,
  resultCurrencyCode: CurrencyCode,
  faker: Faker,
) => {
  let originExchGrossRate = null;
  let originExchOpFee = null;
  let originExchVetRate = null;
  let resultAmount = null;

  switch (type) {
    case 'deposit':
      if (originCurrencyCode !== resultCurrencyCode) {
        originExchGrossRate = new Big(faker.number.float({ min: 1, max: 10, fractionDigits: 6 }));
        const originExchOpFeePercent = new Big(
          faker.number.float({ min: 0, max: 0.04, fractionDigits: 2 }),
        );
        originExchOpFee = originExchGrossRate.times(originExchOpFeePercent);
        originExchVetRate = originExchGrossRate.plus(originExchOpFee);
      }

      resultAmount = originAmount.times(originExchVetRate ?? 1);

      return {
        originExchGrossRate,
        originExchOpFee,
        originExchVetRate,
        resultAmount,
      };
    case 'withdraw':
      if (originCurrencyCode !== resultCurrencyCode) {
        originExchGrossRate = new Big(faker.number.float({ min: 1, max: 10, fractionDigits: 6 }));
        const originExchOpFeePercent = new Big(
          faker.number.float({ min: 0, max: 0.04, fractionDigits: 2 }),
        );
        originExchOpFee = originExchGrossRate.times(originExchOpFeePercent);
        originExchVetRate = originExchGrossRate.plus(originExchOpFee);
      }

      resultAmount = new Big(faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }));

      return {
        originExchGrossRate,
        originExchOpFee,
        originExchVetRate,
        resultAmount: resultAmount.neg(),
      };
    default:
      throw new Error(`Unknown movement type: ${type}`);
  }
};

export const WalletMovementFactory = factory
  .define(WalletMovement, async ({ faker }) => {
    const movementType = faker.helpers.arrayElement(['deposit', 'withdraw']);
    const dateUtc = faker.date.past({ years: 3 });
    const originCurrencyCode = faker.helpers.arrayElement(acceptedCurrencyCodes as CurrencyCode[]);
    const resultCurrencyCode = faker.helpers.arrayElement(acceptedCurrencyCodes as CurrencyCode[]);
    const originAmount =
      movementType === 'withdraw'
        ? new Big(faker.number.float({ min: 500, max: 10000, fractionDigits: 2 })).neg()
        : new Big(faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }));

    const movementData = movementGenerator(
      movementType,
      originAmount,
      originCurrencyCode,
      resultCurrencyCode,
      faker,
    );

    return {
      movementType,
      dateUtc: DateTime.fromJSDate(dateUtc),
      institution: faker.company.name(),
      originCurrencyCode,
      originAmount,
      resultCurrencyCode,
      details: faker.lorem.sentence(),
      createdAt: DateTime.fromJSDate(faker.date.soon({ days: 10, refDate: dateUtc })),
      ...movementData,
    };
  })
  .state('recalculate', (w, ctx) => {
    w.originAmount =
      w.movementType === 'withdraw' ? w.originAmount.abs().neg() : w.originAmount.abs();
    w.createdAt = DateTime.fromJSDate(
      ctx.faker.date.soon({ days: 10, refDate: w.dateUtc.toJSDate() }),
    );
    w.merge({
      ...movementGenerator(
        w.movementType,
        w.originAmount,
        w.originCurrencyCode,
        w.resultCurrencyCode,
        ctx.faker,
      ),
    });
  })
  .build();
