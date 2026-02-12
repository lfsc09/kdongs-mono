import { Logger } from '@adonisjs/core/logger'
import db from '@adonisjs/lucid/services/db'
import Big from 'big.js'
import { DateTime } from 'luxon'
import { lucidStream } from '#services/util/lucid_stream'
import {
  DoneState,
  DoneStates,
  TransactionType,
  TransactionTypes,
} from '../../../core/types/investment/sefbfr.js'
import { BasePerformance } from '../analytics_service.js'

interface AssetPerformance extends BasePerformance {}

/**
 * Get assets performance (done and current profits).
 *
 * @param walletId If provided, gets performance for all SEFBFR assets in that wallet.
 * @param assetId If provided, gets performance for that specific SEFBFR asset.
 * @param applyLivePriceQuote If true, applies live price quote to current shares amount for performance calculation.
 * @param logger Optional logger.
 *
 * @throws Error if neither walletId nor assetId is provided.
 * @returns Map of asset id to asset performance data.
 */
async function getAllAssetsPerformance(
  walletId?: string,
  assetId?: string,
  applyLivePriceQuote: boolean = false,
  logger?: Logger,
): Promise<AssetPerformance[]> {
  if (!walletId && !assetId) {
    throw new Error('Either walletId or assetId must be provided')
  }

  const assetsPerformance = new Map<string, AssetPerformance>()
  const tempAssetsInfo = new Map<
    string,
    {
      sharesAmount: Big
      value: Big
      avgPrice: Big
    }
  >()

  // Get all desired assets basic information
  const assetsData: { id: string; doneState: DoneState; assetName: string }[] = await db
    .from('investment_asset_sefbfrs')
    .select('id', 'done_state as doneState', 'asset_name as assetName')
    .if(
      walletId !== undefined,
      query => query.where('wallet_id', walletId!),
      query => query.where('id', assetId!),
    )

  for (const assetData of assetsData) {
    assetsPerformance.set(assetData.id, {
      costs: new Big(0),
      daysRunning: 0,
      doneDateUtc: null,
      grossAmount: new Big(0),
      id: assetData.id,
      inputAmount: new Big(0),
      isDone: assetData.doneState !== DoneStates.active,
      name: assetData.assetName,
      netAmount: new Big(0),
      startDateUtc: null,
      taxes: new Big(0),
    })
    tempAssetsInfo.set(assetData.id, {
      avgPrice: new Big(0),
      sharesAmount: new Big(0),
      value: new Big(0),
    })
  }

  const assetIds = Array.from(assetsPerformance.keys())
  // Stream all the assets transactions (buys, sells, transfers, bonus shares, splits, inplits and dividends) ordered by date
  const assetsAllTransactions = lucidStream<{
    assetId: string
    type: TransactionType
    dateUtc: Date
    sharesAmount?: string
    priceQuote?: string
    costs?: string | null
    taxes?: string | null
    value?: string | null
    factor?: string | null
  }>(
    db
      .from('investment_asset_sefbfr_buys')
      .select(
        'investment_asset_sefbfr_id as assetId',
        db.raw(`'${TransactionTypes.buy}' as type`),
        'date_utc as dateUtc',
        'shares_amount as sharesAmount',
        'price_quote as priceQuote',
        'fees as costs',
        db.raw('CAST(NULL as decimal(20, 6)) as taxes'),
        db.raw('CAST(NULL as decimal(20, 6)) as value'),
        db.raw('CAST(NULL as decimal(20, 6)) as factor'),
      )
      .whereIn('investment_asset_sefbfr_id', assetIds)
      .unionAll(
        db
          .from('investment_asset_sefbfr_sells')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw(`'${TransactionTypes.sell}' as type`),
            'date_utc as dateUtc',
            'shares_amount as sharesAmount',
            'price_quote as priceQuote',
            'fees as costs',
            'taxes',
            db.raw('CAST(NULL as decimal(20, 6)) as value'),
            db.raw('CAST(NULL as decimal(20, 6)) as factor'),
          )
          .whereIn('investment_asset_sefbfr_id', assetIds),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_transfers')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw(`'${TransactionTypes.transfer}' as type`),
            'date_utc as dateUtc',
            'shares_amount as sharesAmount',
            'close_price_quote as priceQuote',
            db.raw('CAST(NULL as decimal(20, 6)) as costs'),
            db.raw('CAST(NULL as decimal(20, 6)) as taxes'),
            db.raw('CAST(NULL as decimal(20, 6)) as value'),
            db.raw('CAST(NULL as decimal(20, 6)) as factor'),
          )
          .whereIn('investment_asset_sefbfr_id', assetIds),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_bonus_shares')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw(`'${TransactionTypes.bonusShare}' as type`),
            'date_utc as dateUtc',
            db.raw('CAST(NULL as decimal(20, 6)) as sharesAmount'),
            db.raw('CAST(NULL as decimal(20, 6)) as priceQuote'),
            db.raw('CAST(NULL as decimal(20, 6)) as costs'),
            db.raw('CAST(NULL as decimal(20, 6)) as taxes'),
            'value',
            'factor',
          )
          .whereIn('investment_asset_sefbfr_id', assetIds),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_splits')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw(`'${TransactionTypes.split}' as type`),
            'date_utc as dateUtc',
            db.raw('CAST(NULL as decimal(20, 6)) as sharesAmount'),
            db.raw('CAST(NULL as decimal(20, 6)) as priceQuote'),
            db.raw('CAST(NULL as decimal(20, 6)) as costs'),
            db.raw('CAST(NULL as decimal(20, 6)) as taxes'),
            db.raw('CAST(NULL as decimal(20, 6)) as value'),
            'factor',
          )
          .whereIn('investment_asset_sefbfr_id', assetIds),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_inplits')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw(`'${TransactionTypes.inplit}' as type`),
            'date_utc as dateUtc',
            db.raw('CAST(NULL as decimal(20, 6)) as sharesAmount'),
            db.raw('CAST(NULL as decimal(20, 6)) as priceQuote'),
            db.raw('CAST(NULL as decimal(20, 6)) as costs'),
            db.raw('CAST(NULL as decimal(20, 6)) as taxes'),
            db.raw('CAST(NULL as decimal(20, 6)) as value'),
            'factor',
          )
          .whereIn('investment_asset_sefbfr_id', assetIds),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_dividends')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw(`'${TransactionTypes.dividend}' as type`),
            'date_utc as dateUtc',
            db.raw('CAST(NULL as decimal(20, 6)) as sharesAmount'),
            db.raw('CAST(NULL as decimal(20, 6)) as priceQuote'),
            db.raw('CAST(NULL as decimal(20, 6)) as costs'),
            'taxes',
            'value',
            db.raw('CAST(NULL as decimal(20, 6)) as factor'),
          )
          .whereIn('investment_asset_sefbfr_id', assetIds),
      )
      .orderBy('dateUtc', 'asc'),
    100,
  )

  for await (const transaction of assetsAllTransactions) {
    const assetPData = assetsPerformance.get(transaction.assetId)
    const tempAssetPInfo = tempAssetsInfo.get(transaction.assetId)

    if (!assetPData || !tempAssetPInfo) {
      if (logger) {
        logger.warn(
          `Transaction found for asset id ${transaction.assetId}, but asset basic data not found`,
        )
      }
      continue
    }

    const transactionSharesAmount = transaction.sharesAmount
      ? new Big(transaction.sharesAmount)
      : undefined
    const transactionPriceQuote = transaction.priceQuote
      ? new Big(transaction.priceQuote)
      : undefined
    const transactionCosts = new Big(transaction.costs ?? 0)
    const transactionTaxes = new Big(transaction.taxes ?? 0)
    const transactionValue = transaction.value ? new Big(transaction.value) : undefined
    const transactionFactor = transaction.factor ? new Big(transaction.factor) : undefined

    // Sum all transaction costs and taxes
    assetPData.costs = assetPData.costs.add(transactionCosts)
    assetPData.taxes = assetPData.taxes.add(transactionTaxes)

    // Get absolute value of transaction for both buy and sell, as sells shares amount is negative but we want the value to be positive for calculations
    let absTransactionValue = new Big(0)

    switch (transaction.type) {
      case TransactionTypes.buy:
        if (transactionSharesAmount === undefined || transactionPriceQuote === undefined) {
          if (logger) {
            logger.warn(
              `Transaction with id ${transaction.assetId} has invalid shares amount or price quote`,
            )
          }
          // TODO: POST warning msg to user about invalid transaction data
          continue
        }

        absTransactionValue = transactionSharesAmount.abs().mul(transactionPriceQuote)
        // Globally sum the asset shares
        tempAssetPInfo.sharesAmount = tempAssetPInfo.sharesAmount.add(transactionSharesAmount)
        tempAssetPInfo.value = tempAssetPInfo.value.add(absTransactionValue).add(transactionCosts)
        // Avg price considers emoluments and fees as part of the cost of the asset, as they are costs necessary to acquire the asset
        tempAssetPInfo.avgPrice = tempAssetPInfo.sharesAmount.gt(0)
          ? tempAssetPInfo.value.div(tempAssetPInfo.sharesAmount)
          : new Big(0)

        assetPData.inputAmount = assetPData.inputAmount
          .add(absTransactionValue)
          .add(transactionCosts)
        break

      case TransactionTypes.sell:
        if (transactionSharesAmount === undefined || transactionPriceQuote === undefined) {
          if (logger) {
            logger.warn(
              `Transaction with id ${transaction.assetId} has invalid shares amount or price quote`,
            )
          }
          // TODO: POST warning msg to user about invalid transaction data
          continue
        }

        absTransactionValue = transactionSharesAmount.abs().mul(transactionPriceQuote)
        // Globally sum the asset shares
        tempAssetPInfo.sharesAmount = tempAssetPInfo.sharesAmount.add(transactionSharesAmount)
        tempAssetPInfo.value = tempAssetPInfo.sharesAmount.mul(tempAssetPInfo.avgPrice)

        assetPData.grossAmount = assetPData.grossAmount.add(absTransactionValue)
        assetPData.netAmount = assetPData.netAmount.add(absTransactionValue.add(transactionCosts))
        break

      case TransactionTypes.transfer:
        if (transactionSharesAmount === undefined) {
          if (logger) {
            logger.warn(`Transaction with id ${transaction.assetId} has invalid shares amount`)
          }
          // TODO: POST warning msg to user about invalid transaction data
          continue
        }

        // Globally sum the asset shares
        tempAssetPInfo.sharesAmount = tempAssetPInfo.sharesAmount.add(transactionSharesAmount)

        // Transfer shares amount is negative (avg. price is not affected)
        if (transactionSharesAmount.lt(0)) {
          tempAssetPInfo.value = tempAssetPInfo.sharesAmount.mul(tempAssetPInfo.avgPrice)
        }
        // Transfer shares amount is positive (avg. price is affected)
        else {
          if (transactionPriceQuote === undefined) {
            // TODO: POST warning msg to user (that he has a transfer without priceQuote defined, and this may affect his avgPrice)
          }
          tempAssetPInfo.value = tempAssetPInfo.value.add(
            transactionSharesAmount.mul(transactionPriceQuote ?? 0),
          )
          tempAssetPInfo.avgPrice = tempAssetPInfo.sharesAmount.gt(0)
            ? tempAssetPInfo.value.div(tempAssetPInfo.sharesAmount)
            : new Big(0)
        }
        break

      case TransactionTypes.bonusShare:
        if (transactionFactor === undefined) {
          if (logger) {
            logger.warn(`Transaction with id ${transaction.assetId} has invalid factor`)
          }
          // TODO: POST warning msg to user about invalid transaction data
          continue
        }

        // Globally sum the asset shares
        tempAssetPInfo.sharesAmount = tempAssetPInfo.sharesAmount.add(
          tempAssetPInfo.sharesAmount.mul(transactionFactor),
        )
        tempAssetPInfo.avgPrice = tempAssetPInfo.sharesAmount.gt(0)
          ? tempAssetPInfo.value.div(tempAssetPInfo.sharesAmount)
          : new Big(0)
        break

      case TransactionTypes.split:
        if (transactionFactor === undefined) {
          if (logger) {
            logger.warn(`Transaction with id ${transaction.assetId} has invalid factor`)
          }
          // TODO: POST warning msg to user about invalid transaction data
          continue
        }

        // Globally sum the asset shares
        tempAssetPInfo.sharesAmount = tempAssetPInfo.sharesAmount.mul(transactionFactor)
        tempAssetPInfo.avgPrice = tempAssetPInfo.avgPrice.div(transactionFactor)
        break

      case TransactionTypes.inplit:
        if (transactionFactor === undefined) {
          if (logger) {
            logger.warn(`Transaction with id ${transaction.assetId} has invalid factor`)
          }
          // TODO: POST warning msg to user about invalid transaction data
          continue
        }

        // Globally sum the asset shares
        tempAssetPInfo.sharesAmount = tempAssetPInfo.sharesAmount.div(transactionFactor)
        tempAssetPInfo.avgPrice = tempAssetPInfo.avgPrice.mul(transactionFactor)
        break

      case TransactionTypes.dividend:
        if (transactionValue === undefined) {
          if (logger) {
            logger.warn(`Transaction with id ${transaction.assetId} has invalid value`)
          }
          // TODO: POST warning msg to user about invalid transaction data
          continue
        }

        assetPData.grossAmount = assetPData.grossAmount.add(transactionValue)
        assetPData.netAmount = assetPData.netAmount.add(transactionValue).add(transactionCosts)
        break

      default:
        break
    }

    // Find the asset first transaction date
    if (assetPData.startDateUtc === null) {
      assetPData.startDateUtc = DateTime.fromJSDate(transaction.dateUtc)
    }

    // Find the asset last transaction date
    if (
      assetPData.doneDateUtc === null ||
      assetPData.doneDateUtc < DateTime.fromJSDate(transaction.dateUtc)
    ) {
      assetPData.doneDateUtc = DateTime.fromJSDate(transaction.dateUtc)
    }
  }

  for (const [assetId, assetPData] of assetsPerformance.entries()) {
    const tempAssetPInfo = tempAssetsInfo.get(assetId)

    if (applyLivePriceQuote && !assetPData.isDone && tempAssetPInfo) {
      // FIXME: Change this after service to get live price quote is ready
      const livePriceQuote = tempAssetPInfo.avgPrice
      const liveValue = tempAssetPInfo.sharesAmount.mul(livePriceQuote.sub(tempAssetPInfo.avgPrice))
      assetPData.grossAmount = assetPData.grossAmount.add(liveValue)
      // TODO: Must calculate an avg costs to apply to live share value, instead of adding 0 as cost of the live value. This is necessary to not overestimate the profit of the asset while it is still active, as the live value is not a realized profit until the asset is sold.
      assetPData.netAmount = assetPData.netAmount.add(liveValue).add(0)
    }

    if (assetPData.startDateUtc !== null && assetPData.doneDateUtc !== null) {
      assetPData.daysRunning = assetPData.isDone
        ? (assetPData.doneDateUtc.diff(assetPData.startDateUtc, 'days').days ?? 0)
        : applyLivePriceQuote
          ? DateTime.now().diff(assetPData.doneDateUtc, 'days').days
          : 0
    }

    assetsPerformance.set(assetId, assetPData)
  }

  return Array.from(assetsPerformance.values())
}

export default {
  getAllAssetsPerformance,
}
