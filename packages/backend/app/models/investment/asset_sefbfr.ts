import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import db from '@adonisjs/lucid/services/db';
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations';
import Big from 'big.js';
import { DateTime } from 'luxon';
import { v7 as uuidv7 } from 'uuid';
import AssetSefbfrBonusShare from '#models/investment/asset_sefbfr_bonus_share';
import AssetSefbfrBuy from '#models/investment/asset_sefbfr_buy';
import AssetSefbfrDividend from '#models/investment/asset_sefbfr_dividend';
import AssetSefbfrInplit from '#models/investment/asset_sefbfr_inplit';
import AssetSefbfrSell from '#models/investment/asset_sefbfr_sell';
import AssetSefbfrSplit from '#models/investment/asset_sefbfr_split';
import AssetSefbfrTransfer from '#models/investment/asset_sefbfr_transfer';
import Wallet from '#models/investment/wallet';
import type { DoneState } from '../../core/types/investment/sefbfr.js';

type ProfitTrasaction = {
  type: 'buy' | 'sell' | 'transfer' | 'bonus_share' | 'split' | 'inplit' | 'dividend';
  dateUtc: DateTime;
  sharesAmount?: Big;
  priceQuote?: Big;
  costs?: Big | null;
  value?: Big | null;
  factor?: Big | null;
};

type AssetProfit = {
  lastTransactionAt: DateTime | undefined;
  doneProfit: Big;
  currentProfit: Big;
};

export default class AssetSefbfr extends BaseModel {
  static table = 'investment_asset_sefbfr';
  static selfAssignPrimaryKey = true;

  @beforeCreate()
  static assignData(assetSefbfr: AssetSefbfr) {
    assetSefbfr.id = uuidv7();
  }

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare walletId: string; // ID of the wallet that holds this SEFBFR investment
  @belongsTo(() => Wallet)
  declare wallet: BelongsTo<typeof Wallet>;

  @column()
  declare doneState: DoneState; // Indicates the state of the SEFBFR investment

  @column()
  declare holderInstitution: string; // Institution where the SEFBFR is held

  @column()
  declare assetName: string; // Name of the SEFBFR asset

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;

  @hasMany(() => AssetSefbfrBuy, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrBuys: HasMany<typeof AssetSefbfrBuy>;

  @hasMany(() => AssetSefbfrSell, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrSells: HasMany<typeof AssetSefbfrSell>;

  @hasMany(() => AssetSefbfrTransfer, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrTransfers: HasMany<typeof AssetSefbfrTransfer>;

  @hasMany(() => AssetSefbfrBonusShare, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrBonusShares: HasMany<typeof AssetSefbfrBonusShare>;

  @hasMany(() => AssetSefbfrSplit, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrSplits: HasMany<typeof AssetSefbfrSplit>;

  @hasMany(() => AssetSefbfrInplit, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrInplits: HasMany<typeof AssetSefbfrInplit>;

  @hasMany(() => AssetSefbfrDividend, { foreignKey: 'investmentAssetSefbfrId' })
  declare assetSefbfrDividends: HasMany<typeof AssetSefbfrDividend>;

  /**
   * Get all transactions (buys, sells, transfers, bonus shares, splits, inplits, dividends)
   * ordered by date, for performance calculation and charts.
   */
  async getTransactionsChronologically(): Promise<ProfitTrasaction[]> {
    const transactions = await db
      .from('investment_asset_sefbfr_buys')
      .select(
        db.raw("'buy' as type"),
        'date_utc as dateUtc',
        'shares_amount as sharesAmount',
        'price_quote as priceQuote',
        'fees as costs',
        db.raw('NULL as value'),
        db.raw('NULL as factor'),
      )
      .where('investment_asset_sefbfr_id', this.id)
      .unionAll(
        db
          .from('investment_asset_sefbfr_sells')
          .select(
            db.raw("'sell' as type"),
            'date_utc as dateUtc',
            'shares_amount as sharesAmount',
            'price_quote as priceQuote',
            'fees + taxes as costs',
            db.raw('NULL as value'),
            db.raw('NULL as factor'),
          )
          .where('investment_asset_sefbfr_id', this.id),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_transfers')
          .select(
            db.raw("'transfer' as type"),
            'date_utc as dateUtc',
            'shares_amount as sharesAmount',
            'close_price_quote as priceQuote',
            db.raw('NULL as costs'),
            db.raw('NULL as value'),
            db.raw('NULL as factor'),
          )
          .where('investment_asset_sefbfr_id', this.id),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_bonus_shares')
          .select(
            db.raw("'bonus_share' as type"),
            'date_utc as dateUtc',
            db.raw('NULL as sharesAmount'),
            db.raw('NULL as priceQuote'),
            db.raw('NULL as costs'),
            'value',
            'factor',
          )
          .where('investment_asset_sefbfr_id', this.id),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_splits')
          .select(
            db.raw("'split' as type"),
            'date_utc as dateUtc',
            db.raw('NULL as sharesAmount'),
            db.raw('NULL as priceQuote'),
            db.raw('NULL as costs'),
            db.raw('NULL as value'),
            'factor',
          )
          .where('investment_asset_sefbfr_id', this.id),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_inplit')
          .select(
            db.raw("'inplit' as type"),
            'date_utc as dateUtc',
            db.raw('NULL as sharesAmount'),
            db.raw('NULL as priceQuote'),
            db.raw('NULL as costs'),
            db.raw('NULL as value'),
            'factor',
          )
          .where('investment_asset_sefbfr_id', this.id),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_dividends')
          .select(
            db.raw("'dividend' as type"),
            'date_utc as dateUtc',
            db.raw('NULL as sharesAmount'),
            db.raw('NULL as priceQuote'),
            'taxes as costs',
            'value',
            db.raw('NULL as factor'),
          )
          .where('investment_asset_sefbfr_id', this.id),
      )
      .orderBy('dateUtc', 'asc');

    return transactions.map((row: any) => ({
      type: row.type as ProfitTrasaction['type'],
      dateUtc: DateTime.fromJSDate(new Date(row.dateUtc)),
      sharesAmount: row.sharesAmount ? new Big(row.sharesAmount) : undefined,
      priceQuote: row.priceQuote ? new Big(row.priceQuote) : undefined,
      costs: row.costs ? new Big(row.costs) : null,
      value: row.value ? new Big(row.value) : undefined,
      factor: row.factor ? new Big(row.factor) : undefined,
    }));
  }

  /**
   * Calculate profits (done and current) from all transactions
   */
  async getPerformance(): Promise<AssetProfit> {
    const transactions = await this.getTransactionsChronologically();

    let currentPriceQuote = new Big(0);

    const lastTransactionAt = transactions.length > 0 ? transactions.at(-1)!.dateUtc : undefined;
    const current = {
      sharesAmount: new Big(0),
      value: new Big(0),
    };
    let doneProfit = new Big(0);
    let currentProfit = new Big(0);
    let avgPrice = new Big(0);

    for (const transaction of transactions) {
      switch (transaction.type) {
        case 'buy':
          current.sharesAmount = current.sharesAmount.add(transaction.sharesAmount!);
          current.value = current.value
            .add(transaction.sharesAmount!.mul(transaction.priceQuote!))
            .add(transaction.costs!);
          avgPrice = current.value.div(current.sharesAmount);
          break;
        case 'sell':
          // Sell shares amount is negative
          current.sharesAmount = current.sharesAmount.add(transaction.sharesAmount!);
          current.value = current.sharesAmount.mul(avgPrice);
          doneProfit = doneProfit.add(
            transaction
              .sharesAmount!.abs()
              .mul(transaction.priceQuote!.sub(avgPrice))
              .add(transaction.costs!),
          );
          break;
        case 'transfer':
          current.sharesAmount = current.sharesAmount.add(transaction.sharesAmount!);
          // Transfer shares amount is negative (avg. price is not affected)
          if (transaction.sharesAmount!.lt(0)) {
            current.value = current.sharesAmount.mul(avgPrice);
          }
          // Transfer shares amount is positive (avg. price is affected)
          else {
            current.value = current.value.add(
              transaction.sharesAmount!.mul(transaction.priceQuote!),
            );
            avgPrice = current.value.div(current.sharesAmount);
          }
          break;
        case 'bonus_share':
          current.sharesAmount = current.sharesAmount.add(
            current.sharesAmount.mul(transaction.factor!),
          );
          avgPrice = current.value.div(current.sharesAmount);
          break;
        case 'split':
          current.sharesAmount = current.sharesAmount.mul(transaction.factor!);
          avgPrice = avgPrice.div(transaction.factor!);
          break;
        case 'inplit':
          current.sharesAmount = current.sharesAmount.div(transaction.factor!);
          avgPrice = avgPrice.mul(transaction.factor!);
          break;
        case 'dividend':
          doneProfit = doneProfit.add(transaction.value!).add(transaction.costs!);
          break;
        default:
          break;
      }
    }

    // TODO: Remove this after assets have proper current price quote
    currentPriceQuote = avgPrice;

    currentProfit = doneProfit.add(current.sharesAmount.mul(currentPriceQuote.sub(avgPrice)));

    return {
      lastTransactionAt,
      doneProfit,
      currentProfit,
    };
  }
}
