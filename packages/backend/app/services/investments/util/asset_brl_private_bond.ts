import db from '@adonisjs/lucid/services/db';
import Big from 'big.js';
import { DateTime } from 'luxon';
import AssetBrlPrivateBond from '#models/investment/asset_brl_private_bond';

export type BondsTransaction = Map<string, AssetBrlPrivateBond>;

export type BondsPerformance = Map<
  string,
  {
    doneAt: DateTime | undefined;
    doneProfit: Big;
  }
>;

/**
 * Get all transactions ordered by date, for performance calculation and charts.
 *
 * If `walletId` is provided, gets transactions for all bonds in that wallet.
 * If `bondId` is provided, gets transactions for that specific bond.
 *
 * At least one of walletId or bondId must be provided.
 */
async function getBondsChronologically(
  walletId?: string,
  bondId?: string,
): Promise<BondsTransaction> {
  if (!walletId && !bondId) {
    throw new Error('Either walletId or bondId must be provided');
  }

  const transactions = await db
    .from('investment_asset_brl_private_bonds')
    .select()
    .if(
      bondId !== undefined,
      (query) => query.where('id', bondId!),
      (query) => query.where('wallet_id', walletId!),
    )
    .orderBy('enter_date_utc', 'asc');

  const bondsTransactions: BondsTransaction = new Map();
  for (const transaction of transactions) {
    bondsTransactions.set(transaction.id, transaction);
  }

  return bondsTransactions;
}

/**
 * Get bonds performance (done profits).
 *
 * If `walletId` is provided, gets performance for all bonds in that wallet.
 * If `bondId` is provided, gets performance for that specific bond.
 *
 * At least one of walletId or bondId must be provided.
 */
async function getBondsPerformance(walletId?: string, bondId?: string): Promise<BondsPerformance> {
  if (!walletId && !bondId) {
    throw new Error('Either walletId or bondId must be provided');
  }

  const bondsTransactions = await getBondsChronologically(walletId, bondId);
  const bondsPerformance: BondsPerformance = new Map();

  for (const [bondId, transaction] of bondsTransactions.entries()) {
    if (!transaction.isDone) {
      continue;
    }

    const doneProfit = transaction.grossAmount
      ? transaction.grossAmount.add(transaction.fees ?? 0).add(transaction.taxes ?? 0)
      : null;

    bondsPerformance.set(bondId, {
      doneAt: transaction.exitDateUtc ?? undefined,
      doneProfit: doneProfit ?? new Big(0),
    });
  }

  return bondsPerformance;
}

export default {
  getBondsChronologically,
  getBondsPerformance,
};
