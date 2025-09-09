import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import db from '@adonisjs/lucid/services/db';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import Big from 'big.js';
import { DateTime } from 'luxon';
import { v7 as uuidv7 } from 'uuid';
import AssetBrlPublicBondBuy from '#models/investment/asset_brl_public_bond_buy';
import AssetBrlPublicBondSell from '#models/investment/asset_brl_public_bond_sell';
import Wallet from '#models/investment/wallet';
import type {
  BondType,
  IndexType,
  InterestType,
} from '../../core/types/investment/brl_public_bonds.js';

type ProfitTrasaction = {
  type: 'buy' | 'sell';
  dateUtc: DateTime;
  sharesAmount?: Big;
  unitPrice?: Big;
  costs?: Big | null;
};

type AssetProfit = {
  lastTransactionAt: DateTime | undefined;
  doneProfit: Big;
  currentProfit: Big;
};

export default class AssetBrlPublicBond extends BaseModel {
  static table = 'investment_asset_brl_public_bonds';
  static selfAssignPrimaryKey = true;

  @beforeCreate()
  static assignData(assetBrlPublicBond: AssetBrlPublicBond) {
    assetBrlPublicBond.id = uuidv7();
  }

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare walletId: string; // ID of the wallet to which the bond belongs
  @belongsTo(() => Wallet)
  declare wallet: BelongsTo<typeof Wallet>;

  @column()
  declare isDone: boolean; // Indicates if the bond is completed

  @column()
  declare holderInstitution: string; // Institution holding the bond

  @column()
  declare bondName: string; // Name of the public bond investment

  @column()
  declare bondType: BondType; // Type of bond

  @column()
  declare interestType: InterestType; // Type of interest

  @column()
  declare indexType: IndexType; // Type of index

  @column.dateTime()
  declare maturityDateUtc: DateTime; // Maturity date of the bond

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;

  @hasMany(() => AssetBrlPublicBondBuy, { foreignKey: 'investmentAssetBrlPublicBondId' })
  declare assetBrlPublicBondBuys: HasMany<typeof AssetBrlPublicBondBuy>;

  @hasMany(() => AssetBrlPublicBondSell, { foreignKey: 'investmentAssetBrlPublicBondId' })
  declare assetBrlPublicBondSells: HasMany<typeof AssetBrlPublicBondSell>;

  /**
   * Get all transactions (buys, sells) ordered by date, for performance calculation and charts.
   */
  async getTransactionsChronologically(): Promise<ProfitTrasaction[]> {
    const transactions = await db
      .from('investment_asset_brl_public_bond_buys')
      .select(
        db.raw("'buy' as type"),
        'date_utc as dateUtc',
        'shares_amount as sharesAmount',
        'unit_price as unitPrice',
        'fees as costs',
      )
      .where('investment_asset_brl_public_bond_id', this.id)
      .unionAll(
        db
          .from('investment_asset_brl_public_bond_sells')
          .select(
            db.raw("'sell' as type"),
            'date_utc as dateUtc',
            'shares_amount as sharesAmount',
            'unit_price as unitPrice',
            'fees + taxes as costs',
          )
          .where('investment_asset_brl_public_bond_id', this.id),
      )
      .orderBy('dateUtc', 'asc');

    return (
      transactions?.map((transaction) => ({
        type: transaction.type as 'buy' | 'sell',
        dateUtc: DateTime.fromJSDate(transaction.dateUtc),
        sharesAmount: new Big(transaction.sharesAmount),
        unitPrice: new Big(transaction.unitPrice),
        costs: new Big(transaction.costs),
      })) ?? []
    );
  }

  /**
   * Calculate profits (done and current) from all transactions
   */
  async getPerformance(): Promise<AssetProfit> {
    const transactions = await this.getTransactionsChronologically();

    let currentUnitPrice = new Big(0);

    const lastTransactionAt = transactions.length > 0 ? transactions.at(-1)?.dateUtc : undefined;
    const current = {
      sharesAmount: new Big(0),
      value: new Big(0),
    };
    let doneProfit = new Big(0);
    let currentProfit = new Big(0);
    let avgPrice = new Big(0);

    for (const transaction of transactions) {
      if (transaction.sharesAmount === undefined || transaction.unitPrice === undefined) continue;
      switch (transaction.type) {
        case 'buy':
          current.sharesAmount = current.sharesAmount.add(transaction.sharesAmount);
          current.value = current.value
            .add(transaction.sharesAmount.mul(transaction.unitPrice))
            .add(transaction.costs ?? 0);
          avgPrice = current.value.div(current.sharesAmount);
          break;
        case 'sell':
          current.sharesAmount = current.sharesAmount.add(transaction.sharesAmount);
          current.value = current.sharesAmount.mul(avgPrice);
          doneProfit = doneProfit.add(
            transaction.sharesAmount
              .abs()
              .mul(transaction.unitPrice)
              .add(transaction.costs ?? 0),
          );
          break;
      }
    }

    // TODO: Remove this after assets have proper current price quote
    currentUnitPrice = avgPrice;

    currentProfit = doneProfit.add(current.sharesAmount.mul(currentUnitPrice.sub(avgPrice)));

    return {
      lastTransactionAt,
      doneProfit,
      currentProfit,
    };
  }
}
