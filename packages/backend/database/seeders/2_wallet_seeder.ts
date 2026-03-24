import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { CurrencyCodes } from '@kdongs-mono/domain/types/investment/currency-code'
import { WalletMovementTypes } from '@kdongs-mono/domain/types/investment/wallet-movement'
import Big from 'big.js'
import { DateTime } from 'luxon'
import { WalletFactory } from '#database/factories/investment_wallet_factory'
import Wallet from '#models/investment/wallet'
import User from '#models/user/user'

export default class extends BaseSeeder {
  async run() {
    await Wallet.query().delete()

    const userId = (await User.findBy('email', 'admin@gmail.com'))?.id
    if (!userId) {
      throw new Error('Admin user not found. Please run the UserSeeder first.')
    }

    // BRL wallet
    await WalletFactory.merge({
      currencyCode: CurrencyCodes.BRL,
      userId,
    })
      .with('movements', 1, m =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-01-01'),
            movementType: WalletMovementTypes.deposit,
            originAmount: new Big(20000),
            originCurrencyCode: CurrencyCodes.BRL,
            resultCurrencyCode: CurrencyCodes.BRL,
          })
          .apply('recalculate'),
      )
      .with('movements', 1, m =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-02-01'),
            movementType: WalletMovementTypes.withdraw,
            originAmount: new Big(-3500),
            originCurrencyCode: CurrencyCodes.BRL,
            resultCurrencyCode: CurrencyCodes.BRL,
          })
          .apply('recalculate'),
      )
      .with('movements', 1, m =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-03-01'),
            movementType: WalletMovementTypes.deposit,
            originAmount: new Big(15000),
            originCurrencyCode: CurrencyCodes.BRL,
            resultCurrencyCode: CurrencyCodes.BRL,
          })
          .apply('recalculate'),
      )
      .with('assetBrlPrivateBonds', 5)
      .with('assetBrlPublicBonds', 2, pb =>
        pb.with('assetBrlPublicBondBuys', 2).with('assetBrlPublicBondSells', 1),
      )
      .with('assetSefbfrs', 5, pb => pb.with('assetSefbfrBuys', 2).with('assetSefbfrSells', 1))
      .with('assetSefbfrs', 1, pb =>
        pb.with('assetSefbfrBuys', 2).with('assetSefbfrSplits', 1).with('assetSefbfrSells', 1),
      )
      .with('assetSefbfrs', 1, pb =>
        pb
          .with('assetSefbfrBuys', 2)
          .with('assetSefbfrBonusShares', 1)
          .with('assetSefbfrDividends', 1)
          .with('assetSefbfrSells', 1),
      )
      .create()

    await WalletFactory.merge({
      currencyCode: CurrencyCodes.BRL,
      userId,
    })
      .with('movements', 1, m =>
        m
          .merge({
            dateUtc: DateTime.fromSQL('2025-01-01'),
            movementType: WalletMovementTypes.deposit,
            originAmount: new Big(175000),
            originCurrencyCode: CurrencyCodes.BRL,
            resultCurrencyCode: CurrencyCodes.BRL,
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
