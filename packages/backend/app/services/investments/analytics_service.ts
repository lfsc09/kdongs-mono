import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'
import Big from 'big.js'
import { DateTime } from 'luxon'
import Wallet from '#models/investment/wallet'
import { PromiseBatch } from '#services/util/promise_batch'
import {
  LiquidationSeriesAnalyticsRequest,
  LiquidationSeriesAnalyticsResponse,
} from '../../core/dto/investment/analytic/liquidation_series_dto.js'
import {
  PerformanceAnalayticsRequest,
  PerformanceAnalyticsResponse,
} from '../../core/dto/investment/analytic/performance_dto.js'
import { WalletMovementTypes } from '../../core/types/investment/wallet_movement.js'
import AssetBrlPrivateBondUtils from './helpers/asset_brl_private_bond.js'
import AssetBrlPublicBondUtils from './helpers/asset_brl_public_bond.js'
import AssetSefbfrUtils from './helpers/asset_sefbfr.js'

@inject()
export default class AnalyticsService {
  constructor(protected logger: Logger) {}

  async performance(input: PerformanceAnalayticsRequest): Promise<PerformanceAnalyticsResponse> {
    const isWalletIdsArray = Array.isArray(input.walletIds)
    const wallets = await Wallet.query()
      .if(
        !input.walletIds || (isWalletIdsArray && input.walletIds.length === 0),
        q => {
          q.orderBy('updatedAt', 'desc').limit(1)
        },
        q => {
          q.if(
            isWalletIdsArray,
            q => {
              q.whereIn('id', input.walletIds as string[])
            },
            q => {
              q.where('id', input.walletIds as string)
            },
          )
        },
      )
      .where('userId', input.userId)
      .preload('movements', movementQuery => {
        movementQuery.orderBy('dateUtc', 'asc')
      })

    const walletsIterator = new PromiseBatch(
      wallets.map(async wallet => {
        const [brlPrivateBonds, brlPublicBonds, sefbfrAssets] = await Promise.all([
          AssetBrlPrivateBondUtils.getAllBondsPerformance(wallet.id),
          AssetBrlPublicBondUtils.getAllBondsPerformance(
            wallet.id,
            undefined,
            input.useLivePriceQuote,
            this.logger,
          ),
          AssetSefbfrUtils.getAllAssetsPerformance(
            wallet.id,
            undefined,
            input.useLivePriceQuote,
            this.logger,
          ),
        ])

        return {
          brlPrivateBonds,
          brlPublicBonds,
          sefbfrAssets,
          wallet,
        }
      }),
      10,
    )

    const globalAnalytics = {
      breakeven: undefined as Big | undefined,

      // Assets cost and tax analytics
      costs: {
        max: undefined as Big | undefined,
        sum: new Big(0),
      },
      dateEndUtcAsset: undefined as DateTime | undefined,
      dateEndUtcGlobal: undefined as DateTime | undefined,
      dateEndUtcMovement: undefined as DateTime | undefined,
      // Only assets
      dateStartUtcAsset: undefined as DateTime | undefined,

      // Global first and last dates
      dateStartUtcGlobal: undefined as DateTime | undefined,
      // Only movements
      dateStartUtcMovement: undefined as DateTime | undefined,
      grossLosses: {
        max: undefined as Big | undefined,
        sum: new Big(0),
      },

      // Asset's gross profit and loss analytics
      grossProfits: {
        max: undefined as Big | undefined,
        sum: new Big(0),
      },

      // History high and low
      historyHigh: undefined as Big | undefined,
      historyLow: undefined as Big | undefined,

      // Wallet's movements analytics (deposits and withdrawals)
      movements: {
        max: undefined as Big | undefined,
        min: undefined as Big | undefined,
        sum: new Big(0),
      },
      netLosses: {
        avg: undefined as Big | undefined,
        max: undefined as Big | undefined,
        sum: new Big(0),
      },

      // Asset's net profit and loss analytics (considering costs and taxes)
      netProfits: {
        avg: undefined as Big | undefined,
        max: undefined as Big | undefined,
        sum: new Big(0),
      },
      numberOfActiveAssets: 0,
      numberOfActiveAssetsLoss: 0,
      numberOfActiveAssetsProfit: 0,
      numberOfAssets: 0,
      numberOfAssetsLoss: 0,
      numberOfAssetsProfit: 0,

      // Movement/Asset counters
      numberOfMovements: 0,
      numberOfMovementsDeposit: 0,
      numberOfMovementsWithdrawal: 0,
      // Used to calculate the average days until an asset is done, only for assets that are done
      sumDaysByAsset: new Big(0),
      taxes: {
        max: undefined as Big | undefined,
        sum: new Big(0),
      },
    }

    for await (const walletInfo of walletsIterator.process()) {
      // Wallet movements
      for (const movement of walletInfo.wallet.movements) {
        const movementResultAmount =
          movement.movementType === WalletMovementTypes.deposit
            ? movement.resultAmount
            : movement.resultAmount.abs().neg()

        globalAnalytics.dateStartUtcMovement = this.pickDate(
          globalAnalytics.dateStartUtcMovement,
          movement.dateUtc,
          'earliest',
        )
        globalAnalytics.dateEndUtcMovement = this.pickDate(
          globalAnalytics.dateEndUtcMovement,
          movement.dateUtc,
          'latest',
        )

        globalAnalytics.movements.sum = globalAnalytics.movements.sum.add(movementResultAmount)

        // Get the greatest movement result amount (will be a deposit or 0)
        globalAnalytics.movements.max = this.pickBig(
          globalAnalytics.movements.max,
          movementResultAmount,
          'greatest',
        ) as Big
        // Get the lowest movement result amount (will be a withdrawal or 0)
        globalAnalytics.movements.min = this.pickBig(
          globalAnalytics.movements.min,
          movementResultAmount,
          'lowest',
        ) as Big

        globalAnalytics.numberOfMovements += 1
        if (movement.movementType === WalletMovementTypes.deposit) {
          globalAnalytics.numberOfMovementsDeposit += 1
        } else if (movement.movementType === WalletMovementTypes.withdraw) {
          globalAnalytics.numberOfMovementsWithdrawal += 1
        }
      }

      // Private bonds
      for (const bond of walletInfo.brlPrivateBonds) {
        globalAnalytics.dateStartUtcAsset = this.pickDate(
          globalAnalytics.dateStartUtcAsset,
          bond.startDateUtc,
          'earliest',
        )
        globalAnalytics.dateEndUtcAsset = this.pickDate(
          globalAnalytics.dateEndUtcAsset,
          bond.doneDateUtc,
          'latest',
        )

        // Bond had profit
        if (bond.netAmount.gt(0)) {
          globalAnalytics.numberOfAssetsProfit += 1
          if (bond.isDone) {
            globalAnalytics.numberOfActiveAssetsProfit += 1
          }
        } else if (bond.netAmount.lt(0)) {
          globalAnalytics.numberOfAssetsLoss += 1
          if (bond.isDone) {
            globalAnalytics.numberOfActiveAssetsLoss += 1
          }
        }

        // Done bond
        if (bond.isDone) {
          globalAnalytics.sumDaysByAsset = globalAnalytics.sumDaysByAsset.add(bond.daysRunning)
        } else {
          globalAnalytics.numberOfActiveAssets += 1
        }

        globalAnalytics.grossProfits.sum = globalAnalytics.grossProfits.sum.add(
          bond.grossAmount.gt(0) ? bond.grossAmount : 0,
        )
        globalAnalytics.grossLosses.sum = globalAnalytics.grossLosses.sum.add(
          bond.grossAmount.lt(0) ? bond.grossAmount : 0,
        )
        globalAnalytics.netProfits.sum = globalAnalytics.netProfits.sum.add(
          bond.netAmount.gt(0) ? bond.netAmount : 0,
        )
        globalAnalytics.netLosses.sum = globalAnalytics.netLosses.sum.add(
          bond.netAmount.lt(0) ? bond.netAmount : 0,
        )
        globalAnalytics.costs.sum = globalAnalytics.costs.sum.add(bond.feesAndCosts)
        globalAnalytics.taxes.sum = globalAnalytics.taxes.sum.add(bond.feesAndCosts)

        globalAnalytics.grossProfits.max = this.pickBig(
          globalAnalytics.grossProfits.max,
          bond.grossAmount.gt(0) ? bond.grossAmount : 0,
          'greatest',
          false,
        )
        globalAnalytics.grossLosses.max = this.pickBig(
          globalAnalytics.grossLosses.max,
          bond.grossAmount.lt(0) ? bond.grossAmount : 0,
          'lowest',
          false,
        )
        globalAnalytics.netProfits.max = this.pickBig(
          globalAnalytics.netProfits.max,
          bond.netAmount.gt(0) ? bond.netAmount : 0,
          'greatest',
          false,
        )
        globalAnalytics.netLosses.max = this.pickBig(
          globalAnalytics.netLosses.max,
          bond.netAmount.lt(0) ? bond.netAmount : 0,
          'lowest',
          false,
        )
        globalAnalytics.costs.max = this.pickBig(
          globalAnalytics.costs.max,
          bond.feesAndCosts,
          'lowest',
          false,
        )
        globalAnalytics.taxes.max = this.pickBig(
          globalAnalytics.taxes.max,
          bond.feesAndCosts,
          'lowest',
          false,
        )

        const localResultingBalance = globalAnalytics.movements.sum
          .add(globalAnalytics.netProfits.sum)
          .add(globalAnalytics.netLosses.sum)

        globalAnalytics.historyHigh = this.pickBig(
          globalAnalytics.historyHigh,
          localResultingBalance,
          'greatest',
          false,
        )
        globalAnalytics.historyLow = this.pickBig(
          globalAnalytics.historyLow,
          localResultingBalance,
          'lowest',
          false,
        )

        globalAnalytics.numberOfAssets += 1
      }
    }

    // Total resulting profit and loss
    const netProfitAndLossesSum = globalAnalytics.netProfits.sum.add(globalAnalytics.netLosses.sum)

    // Amount of days, months, quarters and years in the range between the first and last investment
    const totalDaysInRange =
      globalAnalytics.dateStartUtcGlobal && globalAnalytics.dateEndUtcGlobal
        ? globalAnalytics.dateEndUtcGlobal.diff(globalAnalytics.dateStartUtcGlobal, 'days').days
        : 0
    const totalMonthsInRange =
      globalAnalytics.dateStartUtcGlobal && globalAnalytics.dateEndUtcGlobal
        ? globalAnalytics.dateEndUtcGlobal.diff(globalAnalytics.dateStartUtcGlobal, 'months').months
        : 0
    const totalQuartersInRange =
      globalAnalytics.dateStartUtcGlobal && globalAnalytics.dateEndUtcGlobal
        ? globalAnalytics.dateEndUtcGlobal.diff(globalAnalytics.dateStartUtcGlobal, 'quarters')
            .quarters
        : 0
    const totalYearsInRange =
      globalAnalytics.dateStartUtcGlobal && globalAnalytics.dateEndUtcGlobal
        ? globalAnalytics.dateEndUtcGlobal.diff(globalAnalytics.dateStartUtcGlobal, 'years').years
        : 0

    globalAnalytics.dateStartUtcGlobal = this.pickDate(
      globalAnalytics.dateStartUtcAsset,
      globalAnalytics.dateStartUtcMovement,
      'earliest',
    )
    globalAnalytics.dateEndUtcGlobal = this.pickDate(
      globalAnalytics.dateEndUtcAsset,
      globalAnalytics.dateEndUtcMovement,
      'latest',
    )

    globalAnalytics.netProfits.avg =
      globalAnalytics.numberOfAssetsProfit > 0
        ? globalAnalytics.netProfits.sum.div(globalAnalytics.numberOfAssetsProfit)
        : undefined

    globalAnalytics.netLosses.avg =
      globalAnalytics.numberOfAssetsLoss > 0
        ? globalAnalytics.netLosses.sum.div(globalAnalytics.numberOfAssetsLoss)
        : undefined

    globalAnalytics.breakeven =
      globalAnalytics.netLosses.avg && globalAnalytics.netProfits.avg
        ? globalAnalytics.netLosses.avg
            .abs()
            .div(globalAnalytics.netProfits.avg.add(globalAnalytics.netLosses.avg.abs()))
        : undefined

    const profitAssetsPerc =
      globalAnalytics.numberOfAssets > 0
        ? new Big(globalAnalytics.numberOfAssetsProfit).div(globalAnalytics.numberOfAssets)
        : undefined

    return {
      data: {
        currencyToShow: 'BRL',
        indicators: {
          assetDateEndUtc: globalAnalytics.dateEndUtcAsset?.toISO() ?? undefined,
          assetDateStartUtc: globalAnalytics.dateStartUtcAsset?.toISO() ?? undefined,

          // Average cost per asset that can be expected for future assets
          avgCostByAsset:
            globalAnalytics.numberOfAssets > 0
              ? globalAnalytics.costs.sum
                  .div(globalAnalytics.numberOfAssets)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,

          // Average cost per <time period> that can be expected
          avgCostByDay:
            totalDaysInRange > 0
              ? globalAnalytics.costs.sum.div(totalDaysInRange).round(2, Big.roundHalfUp).toNumber()
              : undefined,
          avgCostByMonth:
            totalMonthsInRange > 0
              ? globalAnalytics.costs.sum
                  .div(totalMonthsInRange)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,
          avgCostByQuarter:
            totalQuartersInRange > 0
              ? globalAnalytics.costs.sum
                  .div(totalQuartersInRange)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,
          avgCostByYear:
            totalYearsInRange > 0
              ? globalAnalytics.costs.sum
                  .div(totalYearsInRange)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,

          // Average days until an asset is done, only for assets that are done
          avgDaysByAsset:
            globalAnalytics.numberOfAssets > 0
              ? globalAnalytics.sumDaysByAsset
                  .div(globalAnalytics.numberOfAssets)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,

          // Average tax per asset that can be expected for future assets
          avgTaxByAsset:
            globalAnalytics.numberOfAssets > 0
              ? globalAnalytics.taxes.sum
                  .div(globalAnalytics.numberOfAssets)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,

          // Average tax per <time period> that can be expected
          avgTaxByDay:
            totalDaysInRange > 0
              ? globalAnalytics.taxes.sum.div(totalDaysInRange).round(2, Big.roundHalfUp).toNumber()
              : undefined,
          avgTaxByMonth:
            totalMonthsInRange > 0
              ? globalAnalytics.taxes.sum
                  .div(totalMonthsInRange)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,
          avgTaxByQuarter:
            totalQuartersInRange > 0
              ? globalAnalytics.taxes.sum
                  .div(totalQuartersInRange)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,
          avgTaxByYear:
            totalYearsInRange > 0
              ? globalAnalytics.taxes.sum
                  .div(totalYearsInRange)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,

          // Percent of profitable assests it must reach/maintain to be profitable considering the average profit/loss of the wallets
          breakeven: globalAnalytics.breakeven?.round(2, Big.roundHalfUp).toNumber(),
          dateEndUtc: globalAnalytics.dateEndUtcGlobal?.toISO() ?? undefined,

          dateStartUtc: globalAnalytics.dateStartUtcGlobal?.toISO() ?? undefined,

          // How far the current profit percentage is from the breakeven point
          edge:
            globalAnalytics.breakeven && profitAssetsPerc
              ? profitAssetsPerc
                  .minus(globalAnalytics.breakeven)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,

          // Average profit/loss per asset that can be expected for future assets
          expectancyByAsset:
            globalAnalytics.numberOfAssets > 0
              ? netProfitAndLossesSum
                  .div(globalAnalytics.numberOfAssets)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,

          // Average profit/loss per <time period> that can be expected
          expectancyByDay:
            totalDaysInRange > 0
              ? netProfitAndLossesSum.div(totalDaysInRange).round(2, Big.roundHalfUp).toNumber()
              : undefined,
          expectancyByMonth:
            totalMonthsInRange > 0
              ? netProfitAndLossesSum.div(totalMonthsInRange).round(2, Big.roundHalfUp).toNumber()
              : undefined,
          expectancyByQuarter:
            totalQuartersInRange > 0
              ? netProfitAndLossesSum.div(totalQuartersInRange).round(2, Big.roundHalfUp).toNumber()
              : undefined,
          expectancyByYear:
            totalYearsInRange > 0
              ? netProfitAndLossesSum.div(totalYearsInRange).round(2, Big.roundHalfUp).toNumber()
              : undefined,

          historyHigh: globalAnalytics.historyHigh?.round(2, Big.roundHalfUp).toNumber(),
          historyLow: globalAnalytics.historyLow?.round(2, Big.roundHalfUp).toNumber(),
          movementDateEndUtc: globalAnalytics.dateEndUtcMovement?.toISO() ?? undefined,
          movementDateStartUtc: globalAnalytics.dateStartUtcMovement?.toISO() ?? undefined,
          // Average movement amount done in the wallets (considering deposits and withdraws)
          movementsAvg:
            globalAnalytics.numberOfMovements > 0
              ? globalAnalytics.movements.sum
                  .div(globalAnalytics.numberOfMovements)
                  .round(2, Big.roundHalfUp)
                  .toNumber()
              : undefined,
          movementsMax: globalAnalytics.movements.max?.round(2, Big.roundHalfUp).toNumber(),
          movementsMin: globalAnalytics.movements.min?.round(2, Big.roundHalfUp).toNumber(),

          movementsSum: globalAnalytics.movements.sum.round(2, Big.roundHalfUp).toNumber(),
          netLossAvg: globalAnalytics.netLosses.avg?.round(2, Big.roundHalfUp).toNumber(),
          netLossMax: globalAnalytics.netLosses.max?.round(2, Big.roundHalfUp).toNumber(),

          netLossSum: globalAnalytics.netLosses.sum.round(2, Big.roundHalfUp).toNumber(),
          netProfitAvg: globalAnalytics.netProfits.avg?.round(2, Big.roundHalfUp).toNumber(),
          netProfitMax: globalAnalytics.netProfits.max?.round(2, Big.roundHalfUp).toNumber(),

          netProfitSum: globalAnalytics.netProfits.sum.round(2, Big.roundHalfUp).toNumber(),
          numberOfActiveAssets: globalAnalytics.numberOfActiveAssets,
          numberOfActiveAssetsLoss: globalAnalytics.numberOfActiveAssetsLoss,
          numberOfActiveAssetsProfit: globalAnalytics.numberOfActiveAssetsProfit,
          numberOfAssets: globalAnalytics.numberOfAssets,
          numberOfAssetsLoss: globalAnalytics.numberOfAssetsLoss,
          numberOfAssetsProfit: globalAnalytics.numberOfAssetsProfit,

          numberOfMovements: globalAnalytics.numberOfMovements,
          numberOfMovementsDeposit: globalAnalytics.numberOfMovementsDeposit,
          numberOfMovementsWithdrawal: globalAnalytics.numberOfMovementsWithdrawal,
          // Resuling balance considering profits, losses and movements (deposits and withdraws)
          resultingBalanceInCurrency: globalAnalytics.movements.sum
            .add(netProfitAndLossesSum)
            .round(2, Big.roundHalfUp)
            .toNumber(),

          resultingProfitInCurrency: netProfitAndLossesSum.round(2, Big.roundHalfUp).toNumber(),
          // Profit percentage compared to total amount invested (deposits and withdraws)
          resultingProfitInPerc: globalAnalytics.movements.sum.gt(0)
            ? netProfitAndLossesSum
                .div(globalAnalytics.movements.sum)
                .round(2, Big.roundHalfUp)
                .toNumber()
            : undefined,
        },
        walletIds: wallets.map(wallet => wallet.id),
      },
    }
  }

  async liquidationSeries(
    input: LiquidationSeriesAnalyticsRequest,
  ): Promise<LiquidationSeriesAnalyticsResponse> {
    const isWalletIdsArray = Array.isArray(input.walletIds)
    const wallets = await Wallet.query()
      .if(
        !input.walletIds || (isWalletIdsArray && input.walletIds.length === 0),
        q => {
          q.orderBy('updatedAt', 'desc').limit(1)
        },
        q => {
          q.if(
            isWalletIdsArray,
            q => {
              q.whereIn('id', input.walletIds as string[])
            },
            q => {
              q.where('id', input.walletIds as string)
            },
          )
        },
      )
      .where('userId', input.userId)
      .preload('movements', movementQuery => {
        movementQuery.orderBy('dateUtc', 'asc')
      })

    const walletsIterator = new PromiseBatch(
      wallets.map(async wallet => {
        const [brlPrivateBonds, brlPublicBonds, sefbfrAssets] = await Promise.all([
          AssetBrlPrivateBondUtils.getAllBondsPerformance(wallet.id),
          AssetBrlPublicBondUtils.getAllBondsPerformance(
            wallet.id,
            undefined,
            input.useLivePriceQuote,
            this.logger,
          ),
          AssetSefbfrUtils.getAllAssetsPerformance(
            wallet.id,
            undefined,
            input.useLivePriceQuote,
            this.logger,
          ),
        ])

        return {
          brlPrivateBonds,
          brlPublicBonds,
          sefbfrAssets,
          wallet,
        }
      }),
      10,
    )

    const performanceSeries = new Map<string, LiquidationSeriesAnalyticsResponse['data'][number]>(
      [],
    )

    for await (const walletInfo of walletsIterator.process()) {
      performanceSeries.set(walletInfo.wallet.id, {
        dataPoints: [],
        walletId: walletInfo.wallet.id,
        walletName: walletInfo.wallet.name,
      })

      // Wallet movements
      for (const movement of walletInfo.wallet.movements) {
        // Add movement to performance series
        performanceSeries.get(walletInfo.wallet.id)?.dataPoints.push({
          daysRunning: 0,
          doneDateUtc: movement.dateUtc.toMillis(),
          feesAndCosts: 0,
          grossAmount: 0,
          inputAmount: movement.resultAmount.toNumber(),
          netAmount: 0,
          type: 'movement',
        })
      }

      // Private bonds
      for (const bond of walletInfo.brlPrivateBonds) {
        // Add bond to performance series
        performanceSeries.get(walletInfo.wallet.id)?.dataPoints.push({
          daysRunning: bond.daysRunning,
          doneDateUtc: bond.doneDateUtc?.toMillis() ?? 0,
          feesAndCosts: bond.feesAndCosts?.toNumber() ?? 0,
          grossAmount: bond.grossAmount.toNumber(),
          inputAmount: bond.inputAmount.toNumber(),
          netAmount: bond.netAmount.toNumber(),
          type: 'brl_private_bond',
        })
      }
    }

    return {
      data: Array.from(performanceSeries.values()),
    }
  }

  /**
   * Pick the earliest or latest date between two dates, no matter the order they are passed in
   *
   * @param d1 - The first date
   * @param d2 - The second date
   * @param pick - Whether to pick the 'earliest' or 'latest' date
   * @returns The picked date, or undefined if both dates are undefined or null
   */
  private pickDate(
    d1: DateTime | null | undefined,
    d2: DateTime | null | undefined,
    pick: 'earliest' | 'latest',
  ) {
    if (d1 === undefined || d1 === null) {
      return d2 ?? undefined
    }
    if (d2 === undefined || d2 === null) {
      return d1 ?? undefined
    }

    if (pick === 'earliest') {
      return d1 < d2 ? d1 : d2
    } else {
      return d1 > d2 ? d1 : d2
    }
  }

  /**
   * Pick the lowest or greatest number between two numbers, no matter the order they are passed in
   *
   * @param n1 - The first number
   * @param n2 - The second number
   * @param pick - Whether to pick the 'lowest' or 'greatest' number
   * @param coallesceToZero - Whether to coallesce undefined or null values to zero (default: true)
   * @returns The picked number, or (0 or undefined, depending on the `coallesceToZero` parameter) if both numbers are undefined or null
   */
  private pickBig(
    n1: Big | number | null | undefined,
    n2: Big | number | null | undefined,
    pick: 'lowest' | 'greatest',
    coallesceToZero = true,
  ): Big | undefined {
    const bn1 =
      n1 === null || n1 === undefined
        ? coallesceToZero
          ? new Big(0)
          : undefined
        : n1 instanceof Big
          ? n1
          : new Big(n1)
    const bn2 =
      n2 === null || n2 === undefined
        ? coallesceToZero
          ? new Big(0)
          : undefined
        : n2 instanceof Big
          ? n2
          : new Big(n2)

    if (bn1 === undefined) {
      return bn2 ?? undefined
    }
    if (bn2 === undefined) {
      return bn1 ?? undefined
    }

    if (pick === 'lowest') {
      return bn1.lt(bn2) ? bn1 : bn2
    } else {
      return bn1.gt(bn2) ? bn1 : bn2
    }
  }
}
