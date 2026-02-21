import factory from '@adonisjs/lucid/factories'
import type { Faker } from '@faker-js/faker'
import Big from 'big.js'
import { DateTime } from 'luxon'
import WalletMovement from '#models/investment/wallet_movement'
import {
  acceptedCurrencyCodes,
  type CurrencyCode,
} from '../../app/core/types/investment/currency.js'
import {
  acceptedWalletMovementTypes,
  type WalletMovementType,
  WalletMovementTypes,
} from '../../app/core/types/investment/wallet_movement.js'

const movementGenerator = (
  type: WalletMovementType,
  originAmount: Big,
  originCurrencyCode: CurrencyCode,
  resultCurrencyCode: CurrencyCode,
  faker: Faker,
) => {
  let originExchGrossRate = null
  let originExchOpFee = null
  let originExchVetRate = null
  let resultAmount = null

  switch (type) {
    case WalletMovementTypes.deposit:
      if (originCurrencyCode !== resultCurrencyCode) {
        originExchGrossRate = new Big(faker.number.float({ fractionDigits: 6, max: 10, min: 1 }))
        const originExchOpFeePercent = new Big(
          faker.number.float({ fractionDigits: 2, max: 0.04, min: 0 }),
        )
        originExchOpFee = originExchGrossRate.times(originExchOpFeePercent).abs().neg()
        originExchVetRate = originExchGrossRate.plus(originExchOpFee)
      }

      resultAmount = originAmount.times(originExchVetRate ?? 1)

      return {
        originExchGrossRate,
        originExchOpFee,
        originExchVetRate,
        resultAmount,
      }

    case WalletMovementTypes.withdraw:
      if (originCurrencyCode !== resultCurrencyCode) {
        originExchGrossRate = new Big(faker.number.float({ fractionDigits: 6, max: 10, min: 1 }))
        const originExchOpFeePercent = new Big(
          faker.number.float({ fractionDigits: 2, max: 0.04, min: 0 }),
        )
        originExchOpFee = originExchGrossRate.times(originExchOpFeePercent).abs().neg()
        originExchVetRate = originExchGrossRate.plus(originExchOpFee)
      }

      resultAmount = new Big(faker.number.float({ fractionDigits: 2, max: 10000, min: 100 }))

      return {
        originExchGrossRate,
        originExchOpFee,
        originExchVetRate,
        resultAmount: resultAmount.neg(),
      }

    default:
      throw new Error(`Unknown movement type: ${type}`)
  }
}

export const WalletMovementFactory = factory
  .define(WalletMovement, async ({ faker }) => {
    const movementType = faker.helpers.arrayElement(
      acceptedWalletMovementTypes as WalletMovementType[],
    )
    const dateUtc = faker.date.past({ years: 3 })
    const originCurrencyCode = faker.helpers.arrayElement(acceptedCurrencyCodes as CurrencyCode[])
    const resultCurrencyCode = faker.helpers.arrayElement(acceptedCurrencyCodes as CurrencyCode[])
    const originAmount =
      movementType === WalletMovementTypes.withdraw
        ? new Big(faker.number.float({ fractionDigits: 2, max: 10000, min: 500 })).neg()
        : new Big(faker.number.float({ fractionDigits: 2, max: 10000, min: 100 }))

    const movementData = movementGenerator(
      movementType,
      originAmount,
      originCurrencyCode,
      resultCurrencyCode,
      faker,
    )

    return {
      createdAt: DateTime.fromJSDate(faker.date.soon({ days: 10, refDate: dateUtc })),
      dateUtc: DateTime.fromJSDate(dateUtc),
      details: faker.lorem.sentence(),
      institution: faker.company.name(),
      movementType,
      originAmount,
      originCurrencyCode,
      resultCurrencyCode,
      ...movementData,
    }
  })
  .state('recalculate', (w, ctx) => {
    w.originAmount =
      w.movementType === WalletMovementTypes.withdraw
        ? w.originAmount.abs().neg()
        : w.originAmount.abs()
    w.createdAt = DateTime.fromJSDate(
      ctx.faker.date.soon({ days: 10, refDate: w.dateUtc.toJSDate() }),
    )
    w.merge({
      ...movementGenerator(
        w.movementType,
        w.originAmount,
        w.originCurrencyCode,
        w.resultCurrencyCode,
        ctx.faker,
      ),
    })
  })
  .build()
