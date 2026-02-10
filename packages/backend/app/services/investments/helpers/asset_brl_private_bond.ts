import db from '@adonisjs/lucid/services/db'
import Big from 'big.js'
import { DateTime } from 'luxon'
import AssetBrlPrivateBond from '#models/investment/asset_brl_private_bond'

export type BondPerformance = {
  id: string
  name: string
  isDone: boolean
  startDateUtc: DateTime | null
  doneDateUtc: DateTime | null
  inputAmount: Big
  grossAmount: Big
  feesAndCosts: Big
  netAmount: Big
  daysRunning: number
}

/**
 * Get bonds performance (done and current profits).
 *
 * @param walletId If provided, gets performance for all bonds in that wallet.
 * @param bondId If provided, gets performance for that specific bond.
 * @param applyLiveIndexRate If true, applies live index rate to current gross amount calculation, if bond is not done yet.
 *
 * @throws Error if neither walletId nor bondId is provided.
 * @returns Array of bond performances, including done and current profits.
 */
async function getAllBondsPerformance(
  walletId?: string,
  bondId?: string,
  applyLiveIndexRate: boolean = false,
): Promise<BondPerformance[]> {
  if (!walletId && !bondId) {
    throw new Error('Either walletId or bondId must be provided')
  }

  const bondsPerformance = new Map<string, BondPerformance>()
  const bondsData: AssetBrlPrivateBond[] = await db
    .from('investment_asset_brl_private_bonds')
    .select()
    .if(
      bondId !== undefined,
      query => query.where('id', bondId!),
      query => query.where('wallet_id', walletId!),
    )
    .orderBy('enter_date_utc', 'asc')
    .orderBy('exit_date_utc', 'asc')

  for (const bondData of bondsData) {
    let grossAmount = new Big(0)
    const feesAndCosts = new Big(0).add(bondData.fees ?? 0).add(bondData.taxes ?? 0)
    let netAmount = new Big(0)

    if (applyLiveIndexRate && bondData.exitDateUtc === null) {
      // FIXME: Remove this after bond have proper current index rate
      const indexRate = 0
      grossAmount = bondData.inputAmount.mul(new Big(1).add(indexRate))
      netAmount = grossAmount.add(feesAndCosts)
    } else if (bondData.exitDateUtc !== null) {
      grossAmount = bondData.grossAmount!
      netAmount = grossAmount.add(feesAndCosts)
    }

    const daysRunning = bondData.exitDateUtc
      ? bondData.exitDateUtc.diff(bondData.enterDateUtc, 'days').days
      : DateTime.now().diff(bondData.enterDateUtc, 'days').days

    bondsPerformance.set(bondData.id, {
      daysRunning,
      doneDateUtc: bondData.exitDateUtc,
      feesAndCosts,
      grossAmount,
      id: bondData.id,
      inputAmount: bondData.inputAmount,
      isDone: bondData.exitDateUtc !== null,
      name: bondData.bondName,
      netAmount,
      startDateUtc: bondData.enterDateUtc,
    })
  }

  return Array.from(bondsPerformance.values())
}

export default {
  getAllBondsPerformance,
}
