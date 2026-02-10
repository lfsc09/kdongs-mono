import factory from '@adonisjs/lucid/factories'
import Wallet from '#models/investment/wallet'
import {
  acceptedCurrencyCodes,
  type CurrencyCode,
} from '../../app/core/types/investment/currency.js'
import { AssetBrlPrivateBondFactory } from './investment_asset_brl_private_bond_factory.js'
import { AssetBrlPublicBondFactory } from './investment_asset_brl_public_bond_factory.js'
import { WalletMovementFactory } from './investment_wallet_movement_factory.js'

export const WalletFactory = factory
  .define(Wallet, async ({ faker }) => {
    return {
      currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes as CurrencyCode[]),
      name: faker.finance.accountName(),
    }
  })
  .relation('movements', () => WalletMovementFactory)
  .relation('assetBrlPrivateBonds', () => AssetBrlPrivateBondFactory)
  .relation('assetBrlPublicBonds', () => AssetBrlPublicBondFactory)
  .build()
