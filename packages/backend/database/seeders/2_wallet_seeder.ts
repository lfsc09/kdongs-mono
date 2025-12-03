import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Big from 'big.js'
import { DateTime } from 'luxon'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import { UserFactory } from '#database/factories/user_factory'
import Wallet from '#models/investment/wallet'
import User from '#models/user/user'
import { acceptedCurrencyCodes } from '../../app/core/types/investment/currencies.js'
import { UserRole } from '../../app/core/types/user/user_roles.js'

export default class extends BaseSeeder {
  async run() {
    await Wallet.query().delete()

    let userId = (await User.findBy('email', 'admin@gmail.com'))?.id
    if (!userId) {
      userId = (
        await UserFactory.merge([
          { email: 'admin@gmail.com', password: '12345678', role: UserRole.ADMIN },
        ]).create()
      ).id
    }

    // BRL wallet
    await WalletFactory.merge({
      userId,
      currencyCode: acceptedCurrencyCodes.find((c) => c === 'BRL'),
    })
      .with('movements', 1, (m) =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-01-01'),
            originAmount: new Big(20000),
            movementType: 'deposit',
            originCurrencyCode: 'BRL',
            resultCurrencyCode: 'BRL',
          })
          .apply('recalculate'),
      )
      .with('movements', 1, (m) =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-02-01'),
            originAmount: new Big(3500),
            movementType: 'withdraw',
            originCurrencyCode: 'BRL',
            resultCurrencyCode: 'BRL',
          })
          .apply('recalculate'),
      )
      .with('movements', 1, (m) =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-03-01'),
            originAmount: new Big(15000),
            movementType: 'deposit',
            originCurrencyCode: 'BRL',
            resultCurrencyCode: 'BRL',
          })
          .apply('recalculate'),
      )
      .with('assetBrlPrivateBonds', 5)
      .with('assetBrlPublicBonds', 2, (pb) =>
        pb.with('assetBrlPublicBondBuys', 2).with('assetBrlPublicBondSells', 1),
      )
      .create()

    await WalletFactory.merge({
      userId,
      currencyCode: acceptedCurrencyCodes.find((c) => c === 'BRL'),
    })
      .with('movements', 1, (m) =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-01-01'),
            originAmount: new Big(175000),
            movementType: 'deposit',
            originCurrencyCode: 'BRL',
            resultCurrencyCode: 'BRL',
          })
          .apply('recalculate'),
      )
      .with('assetBrlPrivateBonds', 10)
      .with('assetBrlPublicBonds', 2, (pb) =>
        pb.with('assetBrlPublicBondBuys', 2).with('assetBrlPublicBondSells', 1),
      )
      .create()
  }
}
