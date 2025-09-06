import factory from '@adonisjs/lucid/factories';
import Wallet from '#models/investment/wallet';
import {
  acceptedCurrencyCodes,
  type CurrencyCode,
} from '../../contracts/model/investment/currencies.js';
import { AssetBrlPrivateBondFactory } from './investment_asset_brl_private_bond_factory.js';
import { AssetBrlPublicBondFactory } from './investment_asset_brl_public_bond_factory.js';
import { WalletMovementFactory } from './investment_wallet_movement_factory.js';

export const WalletFactory = factory
  .define(Wallet, async ({ faker }) => {
    return {
      name: faker.finance.accountName(),
      currencyCode: faker.helpers.arrayElement(acceptedCurrencyCodes as CurrencyCode[]),
    };
  })
  .relation('movements', () => WalletMovementFactory)
  .relation('assetBrlPrivateBonds', () => AssetBrlPrivateBondFactory)
  .relation('assetBrlPublicBonds', () => AssetBrlPublicBondFactory)
  .build();
