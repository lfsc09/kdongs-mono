import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Big from 'big.js'
import { DateTime } from 'luxon'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import { UserFactory } from '#database/factories/user_factory'
import Wallet from '#models/investment/wallet'
import User from '#models/user/user'
import { Currencies } from '../../app/core/types/investment/currency.js'
import { WalletMovementTypes } from '../../app/core/types/investment/wallet_movement.js'
import { UserRole } from '../../app/core/types/user/user_role.js'

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
      currencyCode: Currencies.BRL,
      userId,
    })
      .with('movements', 1, m =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-01-01'),
            movementType: WalletMovementTypes.deposit,
            originAmount: new Big(20000),
            originCurrencyCode: Currencies.BRL,
            resultCurrencyCode: Currencies.BRL,
          })
          .apply('recalculate'),
      )
      .with('movements', 1, m =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-02-01'),
            movementType: WalletMovementTypes.withdraw,
            originAmount: new Big(3500),
            originCurrencyCode: Currencies.BRL,
            resultCurrencyCode: Currencies.BRL,
          })
          .apply('recalculate'),
      )
      .with('movements', 1, m =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-03-01'),
            movementType: WalletMovementTypes.deposit,
            originAmount: new Big(15000),
            originCurrencyCode: Currencies.BRL,
            resultCurrencyCode: Currencies.BRL,
          })
          .apply('recalculate'),
      )
      .with('assetBrlPrivateBonds', 5)
      .with('assetBrlPublicBonds', 2, pb =>
        pb.with('assetBrlPublicBondBuys', 2).with('assetBrlPublicBondSells', 1),
      )
      .create()

    await WalletFactory.merge({
      currencyCode: Currencies.BRL,
      userId,
    })
      .with('movements', 1, m =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-01-01'),
            movementType: WalletMovementTypes.deposit,
            originAmount: new Big(175000),
            originCurrencyCode: Currencies.BRL,
            resultCurrencyCode: Currencies.BRL,
          })
          .apply('recalculate'),
      )
      .with('assetBrlPrivateBonds', 10)
      .with('assetBrlPublicBonds', 2, pb =>
        pb.with('assetBrlPublicBondBuys', 2).with('assetBrlPublicBondSells', 1),
      )
      .create()
  }
}
