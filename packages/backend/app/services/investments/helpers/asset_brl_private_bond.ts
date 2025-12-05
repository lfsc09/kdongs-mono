import db from '@adonisjs/lucid/services/db'
import Big from 'big.js'
import { DateTime } from 'luxon'
import AssetBrlPrivateBond from '#models/investment/asset_brl_private_bond'
import { objToMap } from '#services/util/obj_to_map'

export type BondsInfo = Map<string, AssetBrlPrivateBond>

export type BondsPerformance = Map<
  string,
  {
    id: string
    bondName: string
    doneProfit: Big
    doneAt: DateTime | undefined
  }
>

/**
 * Get all transactions ordered by date, for performance calculation and charts.
 *
 * If `walletId` is provided, gets transactions for all bonds in that wallet.
 * If `bondId` is provided, gets transactions for that specific bond.
 *
 * At least one of walletId or bondId must be provided.
 */
async function getBondsChronologically(walletId?: string, bondId?: string): Promise<BondsInfo> {
  if (!walletId && !bondId) {
    throw new Error('Either walletId or bondId must be provided')
  }

  const bonds = await db
    .from('investment_asset_brl_private_bonds')
    .select()
    .if(
      bondId !== undefined,
      query => query.where('id', bondId!),
      query => query.where('wallet_id', walletId!),
    )
    .orderBy('enter_date_utc', 'asc')
    .orderBy('exit_date_utc', 'asc')

  const bondsInfos = objToMap<AssetBrlPrivateBond, 'id'>('id', bonds)

  return bondsInfos
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
    throw new Error('Either walletId or bondId must be provided')
  }

  const bondsInfos = await getBondsChronologically(walletId, bondId)
  const bondsPerformance: BondsPerformance = new Map()

  for (const [bondId, bondInfo] of bondsInfos.entries()) {
    const doneProfit = bondInfo.grossAmount
      ? bondInfo.grossAmount.add(bondInfo.fees ?? 0).add(bondInfo.taxes ?? 0)
      : null

    bondsPerformance.set(bondId, {
      bondName: bondInfo.bondName,
      doneAt: bondInfo.exitDateUtc ? bondInfo.exitDateUtc : undefined,
      doneProfit: doneProfit ?? new Big(0),
      id: bondId,
    })
  }

  return bondsPerformance
}

export default {
  getBondsChronologically,
  getBondsPerformance,
}
