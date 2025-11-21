import db from '@adonisjs/lucid/services/db'
import Big from 'big.js'
import { DateTime } from 'luxon'
import { lucidStream } from '#services/util/lucid_stream'
import { objToMap } from '#services/util/obj_to_map'
import { DoneState } from '../../../core/types/investment/sefbfr.js'

type TransactionType = 'buy' | 'sell' | 'transfer' | 'bonus_share' | 'split' | 'inplit' | 'dividend'

type AssetInfo = {
  id: string
  doneState: DoneState
  assetName: string
  lastTransactionAt: DateTime | null
  transactions?: {
    type: TransactionType
    dateUtc: DateTime
    sharesAmount?: Big
    priceQuote?: Big
    costs?: Big | null
    value?: Big | null
    factor?: Big | null
  }[]
}

export type AssetsTransactions = Map<string, AssetInfo>

export type AssetsPerformance = Map<
  string,
  {
    id: string
    doneState: DoneState
    assetName: string
    doneProfit: Big
    currentProfit: Big
    lastTransactionAt: DateTime
  }
>

/**
 * Get all assets info and assets transactions (buys, sells, transfers, bonus shares, splits, inplits, dividends) ordered by date, for performance calculation and charts.
 *
 * If `walletId` is provided, gets transactions for all SEFBFR assets in that wallet.
 * If `assetId` is provided, gets transactions for that specific SEFBFR asset.
 *
 * At least one of walletId or assetId must be provided.
 */
async function getAssetsChronologically(
  walletId?: string,
  assetId?: string,
): Promise<AssetsTransactions> {
  if (!walletId && !assetId) {
    throw new Error('Either walletId or assetId must be provided')
  }

  const assets: { id: string; doneState: DoneState; assetName: string; lastTransactionAt: null }[] =
    await db
      .from('investment_asset_sefbfrs')
      .select(
        'id',
        'done_state as doneState',
        'asset_name as assetName',
        db.raw('NULL as lastTransactionAt'),
      )
      .if(
        walletId !== undefined,
        (query) => query.where('wallet_id', walletId!),
        (query) => query.where('id', assetId!),
      )
  const assetsIds = assets.map((asset) => asset.id)

  const assetsInfo = objToMap<AssetInfo, 'id'>('id', assets)

  const transactions = lucidStream(
    db
      .from('investment_asset_sefbfr_buys')
      .select(
        'investment_asset_sefbfr_id as assetId',
        db.raw("'buy' as type"),
        'date_utc as dateUtc',
        'shares_amount as sharesAmount',
        'price_quote as priceQuote',
        'fees as costs',
        db.raw('CAST(NULL as decimal(20, 6)) as value'),
        db.raw('CAST(NULL as decimal(20, 6)) as factor'),
      )
      .if(
        assetId !== undefined,
        (query) => query.where('investment_asset_sefbfr_id', assetId!),
        (query) => query.whereIn('investment_asset_sefbfr_id', assetsIds),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_sells')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw("'sell' as type"),
            'date_utc as dateUtc',
            'shares_amount as sharesAmount',
            'price_quote as priceQuote',
            db.raw('cast(fees + taxes as decimal(20, 6)) as costs'),
            db.raw('CAST(NULL as decimal(20, 6)) as value'),
            db.raw('CAST(NULL as decimal(20, 6)) as factor'),
          )
          .if(
            assetId !== undefined,
            (query) => query.where('investment_asset_sefbfr_id', assetId!),
            (query) => query.whereIn('investment_asset_sefbfr_id', assetsIds),
          ),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_transfers')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw("'transfer' as type"),
            'date_utc as dateUtc',
            'shares_amount as sharesAmount',
            'close_price_quote as priceQuote',
            db.raw('CAST(NULL as decimal(20, 6)) as costs'),
            db.raw('CAST(NULL as decimal(20, 6)) as value'),
            db.raw('CAST(NULL as decimal(20, 6)) as factor'),
          )
          .if(
            assetId !== undefined,
            (query) => query.where('investment_asset_sefbfr_id', assetId!),
            (query) => query.whereIn('investment_asset_sefbfr_id', assetsIds),
          ),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_bonus_shares')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw("'bonus_share' as type"),
            'date_utc as dateUtc',
            db.raw('CAST(NULL as decimal(20, 6)) as sharesAmount'),
            db.raw('CAST(NULL as decimal(20, 6)) as priceQuote'),
            db.raw('CAST(NULL as decimal(20, 6)) as costs'),
            'value',
            'factor',
          )
          .if(
            assetId !== undefined,
            (query) => query.where('investment_asset_sefbfr_id', assetId!),
            (query) => query.whereIn('investment_asset_sefbfr_id', assetsIds),
          ),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_splits')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw("'split' as type"),
            'date_utc as dateUtc',
            db.raw('CAST(NULL as decimal(20, 6)) as sharesAmount'),
            db.raw('CAST(NULL as decimal(20, 6)) as priceQuote'),
            db.raw('CAST(NULL as decimal(20, 6)) as costs'),
            db.raw('CAST(NULL as decimal(20, 6)) as value'),
            'factor',
          )
          .if(
            assetId !== undefined,
            (query) => query.where('investment_asset_sefbfr_id', assetId!),
            (query) => query.whereIn('investment_asset_sefbfr_id', assetsIds),
          ),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_inplits')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw("'inplit' as type"),
            'date_utc as dateUtc',
            db.raw('CAST(NULL as decimal(20, 6)) as sharesAmount'),
            db.raw('CAST(NULL as decimal(20, 6)) as priceQuote'),
            db.raw('CAST(NULL as decimal(20, 6)) as costs'),
            db.raw('CAST(NULL as decimal(20, 6)) as value'),
            'factor',
          )
          .if(
            assetId !== undefined,
            (query) => query.where('investment_asset_sefbfr_id', assetId!),
            (query) => query.whereIn('investment_asset_sefbfr_id', assetsIds),
          ),
      )
      .unionAll(
        db
          .from('investment_asset_sefbfr_dividends')
          .select(
            'investment_asset_sefbfr_id as assetId',
            db.raw("'dividend' as type"),
            'date_utc as dateUtc',
            db.raw('CAST(NULL as decimal(20, 6)) as sharesAmount'),
            db.raw('CAST(NULL as decimal(20, 6)) as priceQuote'),
            'taxes as costs',
            'value',
            db.raw('CAST(NULL as decimal(20, 6)) as factor'),
          )
          .if(
            assetId !== undefined,
            (query) => query.where('investment_asset_sefbfr_id', assetId!),
            (query) => query.whereIn('investment_asset_sefbfr_id', assetsIds),
          ),
      )
      .orderBy('dateUtc', 'asc'),
    100,
  )

  for await (const transaction of transactions) {
    const assetData = assetsInfo.get(transaction.assetId)
    if (!assetData) {
      // FIXME: log this warning
      continue
    }

    if (
      assetData.lastTransactionAt === null ||
      assetData.lastTransactionAt < DateTime.fromJSDate(transaction.dateUtc)
    ) {
      assetData.lastTransactionAt = DateTime.fromJSDate(transaction.dateUtc)
    }

    if (assetData.transactions === undefined) {
      assetData.transactions = []
    }

    assetData.transactions.push({
      type: transaction.type as TransactionType,
      dateUtc: DateTime.fromJSDate(transaction.dateUtc),
      sharesAmount: transaction.sharesAmount ? new Big(transaction.sharesAmount) : undefined,
      priceQuote: transaction.priceQuote ? new Big(transaction.priceQuote) : undefined,
      costs:
        transaction.costs !== null && transaction.costs !== undefined
          ? new Big(transaction.costs)
          : null,
      value:
        transaction.value !== null && transaction.value !== undefined
          ? new Big(transaction.value)
          : undefined,
      factor:
        transaction.factor !== null && transaction.factor !== undefined
          ? new Big(transaction.factor)
          : undefined,
    })
  }

  return assetsInfo
}

/**
 * Calculate profits (done and current) from all the bond transactions.
 *
 * If `walletId` is provided, calculates performance for all SEFBFR assets in that wallet.
 * If `assetId` is provided, calculates performance for that specific SEFBFR asset.
 *
 * At least one of walletId or assetId must be provided.
 */
async function getAssetsPerformance(
  walletId?: string,
  assetId?: string,
): Promise<AssetsPerformance> {
  if (!walletId && !assetId) {
    throw new Error('Either walletId or assetId must be provided')
  }

  const assetsInfo = await getAssetsChronologically(walletId, assetId)
  const assetsPerformance: AssetsPerformance = new Map()

  for (const [assetId, assetData] of assetsInfo.entries()) {
    if (assetData.transactions === undefined || assetData.transactions.length === 0) continue

    const current = {
      sharesAmount: new Big(0),
      value: new Big(0),
    }
    let currentPriceQuote = new Big(0)
    let doneProfit = new Big(0)
    let currentProfit = new Big(0)
    let avgPrice = new Big(0)

    for (const transaction of assetData.transactions) {
      switch (transaction.type) {
        case 'buy':
          if (transaction.sharesAmount === undefined || transaction.priceQuote === undefined)
            continue
          current.sharesAmount = current.sharesAmount.add(transaction.sharesAmount)
          current.value = current.value
            .add(transaction.sharesAmount.mul(transaction.priceQuote))
            .add(transaction.costs ?? 0)
          avgPrice = current.value.div(current.sharesAmount)
          break
        case 'sell':
          if (transaction.sharesAmount === undefined || transaction.priceQuote === undefined)
            continue
          // Sell shares amount is negative
          current.sharesAmount = current.sharesAmount.add(transaction.sharesAmount)
          current.value = current.sharesAmount.mul(avgPrice)
          doneProfit = doneProfit.add(
            transaction.sharesAmount
              .abs()
              .mul(transaction.priceQuote.sub(avgPrice))
              .add(transaction.costs ?? 0),
          )
          break
        case 'transfer':
          if (transaction.sharesAmount === undefined) continue
          current.sharesAmount = current.sharesAmount.add(transaction.sharesAmount)
          // Transfer shares amount is negative (avg. price is not affected)
          if (transaction.sharesAmount.lt(0)) {
            current.value = current.sharesAmount.mul(avgPrice)
          }
          // Transfer shares amount is positive (avg. price is affected)
          else {
            // Undo shares amount sum if price quote is undefined
            if (transaction.priceQuote === undefined) {
              current.sharesAmount = current.sharesAmount.sub(transaction.sharesAmount)
              continue
            }
            current.value = current.value.add(transaction.sharesAmount.mul(transaction.priceQuote))
            avgPrice = current.value.div(current.sharesAmount)
          }
          break
        case 'bonus_share':
          if (transaction.factor === undefined || transaction.factor === null) continue
          current.sharesAmount = current.sharesAmount.add(
            current.sharesAmount.mul(transaction.factor),
          )
          avgPrice = current.value.div(current.sharesAmount)
          break
        case 'split':
          if (transaction.factor === undefined || transaction.factor === null) continue
          current.sharesAmount = current.sharesAmount.mul(transaction.factor)
          avgPrice = avgPrice.div(transaction.factor)
          break
        case 'inplit':
          if (transaction.factor === undefined || transaction.factor === null) continue
          current.sharesAmount = current.sharesAmount.div(transaction.factor)
          avgPrice = avgPrice.mul(transaction.factor)
          break
        case 'dividend':
          if (transaction.value === undefined || transaction.value === null) continue
          doneProfit = doneProfit.add(transaction.value).add(transaction.costs ?? 0)
          break
        default:
          break
      }
    }

    // TODO: Remove this after assets have proper current price quote
    currentPriceQuote = avgPrice
    currentProfit = doneProfit.add(current.sharesAmount.mul(currentPriceQuote.sub(avgPrice)))

    assetsPerformance.set(assetId, {
      id: assetData.id,
      doneState: assetData.doneState,
      assetName: assetData.assetName,
      doneProfit,
      currentProfit,
      lastTransactionAt: assetData.lastTransactionAt!,
    })
  }

  return assetsPerformance
}

export default {
  getAssetsChronologically,
  getAssetsPerformance,
}
