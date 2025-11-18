import db from '@adonisjs/lucid/services/db';
import Big from 'big.js';
import { DateTime } from 'luxon';

export type BondsTransactions = Map<
  string,
  {
    type: 'buy' | 'sell';
    dateUtc: DateTime;
    sharesAmount?: Big;
    unitPrice?: Big;
    costs?: Big | null;
  }[]
>;

export type BondsPerformance = Map<
  string,
  {
    lastTransactionAt: DateTime | undefined;
    doneProfit: Big;
    currentProfit: Big;
  }
>;

/**
 * Get all transactions (buys, sells) ordered by date, for performance calculation and charts.
 *
 * If `walletId` is provided, gets transactions for all bonds in that wallet.
 * If `bondId` is provided, gets transactions for that specific bond.
 *
 * At least one of walletId or bondId must be provided.
 */
async function getBondsTransactionsChronologically(
  walletId?: string,
  bondId?: string,
): Promise<BondsTransactions> {
  if (!walletId && !bondId) {
    throw new Error('Either walletId or bondId must be provided');
  }

  let bondsIds: string[] = [];
  if (walletId && !bondId) {
    bondsIds = await db
      .from('investment_asset_brl_public_bonds')
      .select('id')
      .where('wallet_id', walletId)
      .then((rows) => rows.map((row) => row.id));
  }

  const transactions = await db
    .from('investment_asset_brl_public_bond_buys')
    .select(
      'investment_asset_brl_public_bond_id as bondId',
      db.raw("'buy' as type"),
      'date_utc as dateUtc',
      'shares_amount as sharesAmount',
      'unit_price as unitPrice',
      'fees as costs',
    )
    .if(
      bondId !== undefined,
      (query) => query.where('investment_asset_brl_public_bond_id', bondId!),
      (query) => query.whereIn('investment_asset_brl_public_bond_id', bondsIds),
    )
    .unionAll(
      db
        .from('investment_asset_brl_public_bond_sells')
        .select(
          'investment_asset_brl_public_bond_id as bondId',
          db.raw("'sell' as type"),
          'date_utc as dateUtc',
          'shares_amount as sharesAmount',
          'unit_price as unitPrice',
          db.raw('fees + taxes as costs'),
        )
        .if(
          bondId !== undefined,
          (query) => query.where('investment_asset_brl_public_bond_id', bondId!),
          (query) => query.whereIn('investment_asset_brl_public_bond_id', bondsIds),
        ),
    )
    .orderBy('dateUtc', 'asc');

  const bondsTransactions: BondsTransactions = new Map();
  for (const transaction of transactions) {
    const bondId = transaction.bondId;
    if (!bondsTransactions.has(bondId)) {
      bondsTransactions.set(bondId, []);
    }
    bondsTransactions.get(bondId)!.push({
      type: transaction.type as 'buy' | 'sell',
      dateUtc: DateTime.fromJSDate(transaction.dateUtc),
      sharesAmount: transaction.sharesAmount ? new Big(transaction.sharesAmount) : undefined,
      unitPrice: transaction.unitPrice ? new Big(transaction.unitPrice) : undefined,
      costs:
        transaction.costs !== null && transaction.costs !== undefined
          ? new Big(transaction.costs)
          : null,
    });
  }

  return bondsTransactions;
}

/**
 * Calculate profits (done and current) from all the bond transactions.
 *
 * If `walletId` is provided, calculates performance for all bonds in that wallet.
 * If `bondId` is provided, calculates performance for that specific bond.
 *
 * At least one of walletId or bondId must be provided.
 */
async function getBondsPerformance(walletId?: string, bondId?: string): Promise<BondsPerformance> {
  if (!walletId && !bondId) {
    throw new Error('Either walletId or bondId must be provided');
  }

  const bondsTransactions = await getBondsTransactionsChronologically(walletId, bondId);
  const bondsPerformance: BondsPerformance = new Map();

  for (const [bondId, transactions] of bondsTransactions.entries()) {
    const lastTransactionAt = transactions.length > 0 ? transactions.at(-1)?.dateUtc : undefined;
    const current = {
      sharesAmount: new Big(0),
      value: new Big(0),
    };
    let currentUnitPrice = new Big(0);
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

    bondsPerformance.set(bondId, {
      lastTransactionAt,
      doneProfit,
      currentProfit,
    });
  }

  return bondsPerformance;
}

export default {
  getBondsTransactionsChronologically,
  getBondsPerformance,
};
