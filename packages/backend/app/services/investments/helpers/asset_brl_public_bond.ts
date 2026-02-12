import { Logger } from '@adonisjs/core/logger'
import db from '@adonisjs/lucid/services/db'
import Big from 'big.js'
import { DateTime } from 'luxon'
import { lucidStream } from '#services/util/lucid_stream'
import {
  TransactionType,
  TransactionTypes,
} from '../../../core/types/investment/brl_public_bond.js'
import { BasePerformance } from '../analytics_service.js'

interface BondPerformance extends BasePerformance {}

/**
 * Get bonds performance (done and current profits).
 *
 * @param walletId If provided, gets performance for all bonds in that wallet.
 * @param bondId If provided, gets performance for that specific bond.
 * @param applyLivePriceQuote If true, applies live price quote to current shares amount for performance calculation.
 * @param logger Optional logger.
 *
 * @throws Error if neither walletId nor bondId is provided.
 * @returns Array of bond performance data.
 */
async function getAllBondsPerformance(
  walletId?: string,
  bondId?: string,
  applyLivePriceQuote: boolean = false,
  logger?: Logger,
): Promise<BondPerformance[]> {
  if (!walletId && !bondId) {
    throw new Error('Either walletId or bondId must be provided')
  }

  const bondsPerformance = new Map<string, BondPerformance>()
  const tempBondsInfo = new Map<
    string,
    {
      sharesAmount: Big
      value: Big
      avgPrice: Big
    }
  >()

  // Get all desired bonds basic information
  const bondsData: { id: string; isDone: boolean; bondName: string }[] = await db
    .from('investment_asset_brl_public_bonds')
    .select('id', 'is_done as isDone', 'bond_name as bondName')
    .if(
      walletId !== undefined,
      query => query.where('wallet_id', walletId!),
      query => query.where('id', bondId!),
    )

  for (const bondData of bondsData) {
    bondsPerformance.set(bondData.id, {
      costs: new Big(0),
      daysRunning: 0,
      doneDateUtc: null,
      grossAmount: new Big(0),
      id: bondData.id,
      inputAmount: new Big(0),
      isDone: bondData.isDone,
      name: bondData.bondName,
      netAmount: new Big(0),
      startDateUtc: null,
      taxes: new Big(0),
    })
    tempBondsInfo.set(bondData.id, {
      avgPrice: new Big(0),
      sharesAmount: new Big(0),
      value: new Big(0),
    })
  }

  const bondIds = Array.from(bondsPerformance.keys())
  // Stream all the bonds transactions (buys and sells) ordered by date
  const bondsAllTransactions = lucidStream<{
    bondId: string
    type: TransactionType
    dateUtc: Date
    sharesAmount?: string
    unitPrice?: string
    costs?: string | null
    taxes?: string | null
  }>(
    db
      .from('investment_asset_brl_public_bond_buys')
      .select(
        'investment_asset_brl_public_bond_id as bondId',
        db.raw(`'${TransactionTypes.buy}' as type`),
        'date_utc as dateUtc',
        'shares_amount as sharesAmount',
        'unit_price as unitPrice',
        'fees as costs',
        db.raw('0 as taxes'),
      )
      .whereIn('investment_asset_brl_public_bond_id', bondIds)
      .unionAll(
        db
          .from('investment_asset_brl_public_bond_sells')
          .select(
            'investment_asset_brl_public_bond_id as bondId',
            db.raw(`'${TransactionTypes.sell}' as type`),
            'date_utc as dateUtc',
            'shares_amount as sharesAmount',
            'unit_price as unitPrice',
            db.raw('fees as costs'),
            'taxes as taxes',
          )
          .whereIn('investment_asset_brl_public_bond_id', bondIds),
      )
      .orderBy('dateUtc', 'asc'),
    100,
  )

  for await (const transaction of bondsAllTransactions) {
    const bondPData = bondsPerformance.get(transaction.bondId)
    const tempBondPInfo = tempBondsInfo.get(transaction.bondId)

    if (!bondPData || !tempBondPInfo) {
      if (logger) {
        logger.warn(
          `Transaction found for bond id ${transaction.bondId}, but bond basic data not found`,
        )
      }
      continue
    }

    const transactionSharesAmount = transaction.sharesAmount
      ? new Big(transaction.sharesAmount)
      : undefined
    const transactionUnitPrice = transaction.unitPrice ? new Big(transaction.unitPrice) : undefined
    const transactionCosts = new Big(transaction.costs ?? 0)
    const transactionTaxes = new Big(transaction.taxes ?? 0)

    if (transactionSharesAmount === undefined || transactionUnitPrice === undefined) {
      if (logger) {
        logger.warn(
          `Transaction with id ${transaction.bondId} has invalid shares amount or unit price`,
        )
      }
      // TODO: POST warning msg to user about invalid transaction data
      continue
    }

    // Find the bond first transaction date
    if (bondPData.startDateUtc === null) {
      bondPData.startDateUtc = DateTime.fromJSDate(transaction.dateUtc)
    }

    // Find the bond last transaction date
    if (
      bondPData.doneDateUtc === null ||
      bondPData.doneDateUtc < DateTime.fromJSDate(transaction.dateUtc)
    ) {
      bondPData.doneDateUtc = DateTime.fromJSDate(transaction.dateUtc)
    }

    // Sum all transaction costs and taxes
    bondPData.costs = bondPData.costs.add(transactionCosts)
    bondPData.taxes = bondPData.taxes.add(transactionTaxes)

    // Get absolute value of transaction for both buy and sell, as sells shares amount is negative but we want the value to be positive for calculations
    const absTransactionValue = transactionSharesAmount.abs().mul(transactionUnitPrice)

    // Globally sum the bond shares
    tempBondPInfo.sharesAmount = tempBondPInfo.sharesAmount.add(transactionSharesAmount)

    switch (transaction.type) {
      case TransactionTypes.buy:
        tempBondPInfo.value = tempBondPInfo.value.add(absTransactionValue).add(transactionCosts)
        // Avg price considers emoluments and fees as part of the cost of the asset, as they are costs necessary to acquire the asset
        tempBondPInfo.avgPrice = tempBondPInfo.sharesAmount.gt(0)
          ? tempBondPInfo.value.div(tempBondPInfo.sharesAmount)
          : new Big(0)

        bondPData.inputAmount = bondPData.inputAmount.add(absTransactionValue)
        break

      case TransactionTypes.sell:
        tempBondPInfo.value = tempBondPInfo.sharesAmount.mul(tempBondPInfo.avgPrice)
        bondPData.grossAmount = bondPData.grossAmount.add(absTransactionValue)
        bondPData.netAmount = bondPData.netAmount.add(
          absTransactionValue.add(transactionCosts).add(transactionTaxes),
        )
        break

      default:
        break
    }
  }

  for (const [bondId, bondPData] of bondsPerformance.entries()) {
    const tempBondPInfo = tempBondsInfo.get(bondId)

    if (applyLivePriceQuote && !bondPData.isDone && tempBondPInfo) {
      // FIXME: Change this after service to get live price quote is ready
      const livePriceQuote = tempBondPInfo.avgPrice
      const liveValue = tempBondPInfo.sharesAmount.mul(livePriceQuote.sub(tempBondPInfo.avgPrice))
      bondPData.grossAmount = bondPData.grossAmount.add(liveValue)
      // TODO: Must calculate an avg costs to apply to live share value, instead of adding 0 as cost of the live value. This is necessary to not overestimate the profit of the asset while it is still active, as the live value is not a realized profit until the asset is sold.
      bondPData.netAmount = bondPData.netAmount.add(liveValue).add(0)
    }

    if (bondPData.startDateUtc !== null && bondPData.doneDateUtc !== null) {
      bondPData.daysRunning = bondPData.isDone
        ? (bondPData.doneDateUtc.diff(bondPData.startDateUtc, 'days').days ?? 0)
        : applyLivePriceQuote
          ? DateTime.now().diff(bondPData.doneDateUtc, 'days').days
          : 0
    }

    bondsPerformance.set(bondId, bondPData)
  }

  return Array.from(bondsPerformance.values())
}

// async function getBondsProfitEvents(walletId?: string, bondId?: string): Promise<BondsProfitEvents> {

// }

export default {
  getAllBondsPerformance,
}
