import db from '@adonisjs/lucid/services/db'
import Big from 'big.js'
import { DateTime } from 'luxon'
import { BasePerformance, basePerformanceSorter } from './base_performance.js'

interface BondPerformance extends BasePerformance {}

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
  const bondsData: {
    id: string
    isDone: boolean
    bondName: string
    inputAmount: string
    grossAmount: string | null
    fees: string | null
    taxes: string | null
    enterDateUtc: Date
    exitDateUtc: Date | null
  }[] = await db
    .from('investment_asset_brl_private_bonds')
    .select(
      'id',
      'is_done as isDone',
      'bond_name as bondName',
      'input_amount as inputAmount',
      'gross_amount as grossAmount',
      'fees',
      'taxes',
      'enter_date_utc as enterDateUtc',
      'exit_date_utc as exitDateUtc',
    )
    .if(
      bondId !== undefined,
      query => query.where('id', bondId!),
      query => query.where('wallet_id', walletId!),
    )

  for (const bondData of bondsData) {
    const enterDateUtc = DateTime.fromJSDate(bondData.enterDateUtc)
    const exitDateUtc = bondData.exitDateUtc
      ? DateTime.fromJSDate(bondData.exitDateUtc)
      : enterDateUtc
    const inputAmount = new Big(bondData.inputAmount)
    const costsAmount = new Big(bondData.fees ?? 0)
    const taxesAmount = new Big(bondData.taxes ?? 0)
    let grossAmount = new Big(0)
    let netAmount = new Big(0)

    if (bondData.isDone) {
      if (bondData.grossAmount === null) {
        // TODO: POST warning msg to user about invalid transaction data
      }
      grossAmount = new Big(bondData.grossAmount ?? 0)
      netAmount = grossAmount.add(costsAmount).add(taxesAmount)
    }

    if (applyLiveIndexRate && !bondData.isDone) {
      // FIXME: Remove this after bond have proper current index rate
      const indexRate = 0
      grossAmount = inputAmount.mul(new Big(1).add(indexRate))
      netAmount = grossAmount.add(costsAmount).add(taxesAmount)
    }

    const daysRunning = bondData.isDone
      ? exitDateUtc.diff(enterDateUtc, 'days').days
      : applyLiveIndexRate
        ? DateTime.now().diff(enterDateUtc, 'days').days
        : 0

    bondsPerformance.set(bondData.id, {
      costs: costsAmount,
      daysRunning: new Big(daysRunning).round(2, Big.roundHalfUp).toNumber(),
      grossAmount,
      id: bondData.id,
      inputAmount: inputAmount,
      isDone: bondData.isDone,
      latestDateUtc: exitDateUtc,
      name: bondData.bondName,
      netAmount,
      startDateUtc: enterDateUtc,
      taxes: taxesAmount,
    })
  }

  return Array.from(bondsPerformance.values()).sort((a, b) => basePerformanceSorter(a, b, 'asc'))
}

export default {
  getAllBondsPerformance,
}
