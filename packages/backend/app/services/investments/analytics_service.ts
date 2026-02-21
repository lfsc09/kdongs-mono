import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'
import Big from 'big.js'
import { DateTime } from 'luxon'
import Wallet from '#models/investment/wallet'
import { PromiseBatch } from '#services/util/promise_batch'
import {
  AnalyticSerie,
  AnalyticSerieDataPoint,
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
import { BasePerformance } from './helpers/base_performance.js'

type GlobalAnalytics = {
  breakeven: Big | undefined
  costs: {
    max: Big | undefined
    sum: Big
  }
  dateEndUtcAsset: DateTime | undefined
  dateEndUtcGlobal: DateTime | undefined
  dateEndUtcMovement: DateTime | undefined
  dateStartUtcAsset: DateTime | undefined
  dateStartUtcGlobal: DateTime | undefined
  dateStartUtcMovement: DateTime | undefined
  grossLosses: {
    min: Big | undefined
    max: Big | undefined
    sum: Big
  }
  grossProfits: {
    min: Big | undefined
    max: Big | undefined
    sum: Big
  }
  historyHighestBalance: Big | undefined
  historyLowestBalance: Big | undefined
  historyHighestNet: Big | undefined
  historyLowestNet: Big | undefined
  movements: {
    max: Big | undefined
    min: Big | undefined
    sum: Big
  }
  netLosses: {
    avg: Big | undefined
    min: Big | undefined
    max: Big | undefined
    sum: Big
  }
  netProfits: {
    avg: Big | undefined
    min: Big | undefined
    max: Big | undefined
    sum: Big
  }
  numberOfActiveAssets: number
  numberOfActiveAssetsLoss: number
  numberOfActiveAssetsProfit: number
  numberOfAssets: number
  numberOfAssetsLoss: number
  numberOfAssetsProfit: number
  numberOfMovements: number
  numberOfMovementsDeposit: number
  numberOfMovementsWithdrawal: number
  sumDaysByAsset: Big
  taxes: {
    max: Big | undefined
    sum: Big
  }
}

@inject()
export default class AnalyticsService {
  constructor(protected logger: Logger) {}

  // TODO: use input.selectedCurrency to convert values to the selected currency
  async performance(
    input: PerformanceAnalayticsRequest,
  ): Promise<PerformanceAnalyticsResponse | null> {
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

    if (wallets.length === 0) {
      return null
    }

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

    const walletCurrencies = wallets.map(wallet => wallet.currencyCode)
    const usedCurrency = this.decideCurrencyToShow(walletCurrencies, input.selectedCurrency)

    const globalAnalytics: GlobalAnalytics = {
      breakeven: undefined,
      // Assets cost analytics
      costs: {
        max: undefined,
        sum: new Big(0),
      },
      dateEndUtcAsset: undefined,
      dateEndUtcGlobal: undefined,
      dateEndUtcMovement: undefined,
      // Only assets
      dateStartUtcAsset: undefined,
      // Global first and last dates
      dateStartUtcGlobal: undefined,
      // Only movements
      dateStartUtcMovement: undefined,
      // Asset's gross loss analytics
      grossLosses: {
        max: undefined,
        min: undefined,
        sum: new Big(0),
      },
      // Asset's gross profit analytics
      grossProfits: {
        max: undefined,
        min: undefined,
        sum: new Big(0),
      },
      // History high and low (Balance and Net profits)
      historyHighestBalance: undefined,
      historyHighestNet: undefined,
      historyLowestBalance: undefined,
      historyLowestNet: undefined,
      // Wallet's movements analytics (deposits and withdrawals)
      movements: {
        max: undefined,
        min: undefined,
        sum: new Big(0),
      },
      // Asset's net loss analytics (considering costs and taxes)
      netLosses: {
        avg: undefined,
        max: undefined,
        min: undefined,
        sum: new Big(0),
      },
      // Asset's net profit analytics (considering costs and taxes)
      netProfits: {
        avg: undefined,
        max: undefined,
        min: undefined,
        sum: new Big(0),
      },
      numberOfActiveAssets: 0,
      numberOfActiveAssetsLoss: 0,
      numberOfActiveAssetsProfit: 0,
      numberOfAssets: 0,
      numberOfAssetsLoss: 0,
      numberOfAssetsProfit: 0,
      numberOfMovements: 0,
      numberOfMovementsDeposit: 0,
      numberOfMovementsWithdrawal: 0,
      // Used to calculate the average days until an asset is done, only for assets that are done
      sumDaysByAsset: new Big(0),
      // Asset's tax analytics
      taxes: {
        max: undefined,
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
      this.calculateAssetTypePerformance(walletInfo.brlPrivateBonds, globalAnalytics)

      // Public bonds
      this.calculateAssetTypePerformance(walletInfo.brlPublicBonds, globalAnalytics)

      // SEFBFR assets
      this.calculateAssetTypePerformance(walletInfo.sefbfrAssets, globalAnalytics)
    }

    // Total resulting profit and loss
    const netProfitAndLossesSum = globalAnalytics.netProfits.sum.add(globalAnalytics.netLosses.sum)

    // Amount of days, months, quarters and years in the range between the first and last investment
    const totalDaysInRange =
      globalAnalytics.dateStartUtcAsset && globalAnalytics.dateEndUtcAsset
        ? globalAnalytics.dateEndUtcAsset.diff(globalAnalytics.dateStartUtcAsset, 'days').days
        : 0
    const totalMonthsInRange =
      globalAnalytics.dateStartUtcAsset && globalAnalytics.dateEndUtcAsset
        ? globalAnalytics.dateEndUtcAsset.diff(globalAnalytics.dateStartUtcAsset, 'months').months
        : 0
    const totalQuartersInRange =
      globalAnalytics.dateStartUtcAsset && globalAnalytics.dateEndUtcAsset
        ? globalAnalytics.dateEndUtcAsset.diff(globalAnalytics.dateStartUtcAsset, 'quarters')
            .quarters
        : 0
    const totalYearsInRange =
      globalAnalytics.dateStartUtcAsset && globalAnalytics.dateEndUtcAsset
        ? globalAnalytics.dateEndUtcAsset.diff(globalAnalytics.dateStartUtcAsset, 'years').years
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
        currencyToShow: usedCurrency,
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
                  .round(0, Big.roundHalfUp)
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
          historyHighestBalance: globalAnalytics.historyHighestBalance
            ?.round(2, Big.roundHalfUp)
            .toNumber(),
          historyHighestNet: globalAnalytics.historyHighestNet
            ?.round(2, Big.roundHalfUp)
            .toNumber(),
          // Only show the history low if it's lower than the sum of movements, otherwise it is not relevant
          historyLowestBalance:
            (globalAnalytics.historyLowestBalance?.lt(globalAnalytics.movements.sum) ?? false)
              ? globalAnalytics.historyLowestBalance?.round(2, Big.roundHalfUp).toNumber()
              : undefined,
          historyLowestNet:
            (globalAnalytics.historyLowestNet?.lt(0) ?? false)
              ? globalAnalytics.historyLowestNet?.round(2, Big.roundHalfUp).toNumber()
              : undefined,
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
          netLossMin: globalAnalytics.netLosses.min?.round(2, Big.roundHalfUp).toNumber(),
          netLossSum: globalAnalytics.netLosses.sum.round(2, Big.roundHalfUp).toNumber(),
          netProfitAvg: globalAnalytics.netProfits.avg?.round(2, Big.roundHalfUp).toNumber(),
          netProfitMax: globalAnalytics.netProfits.max?.round(2, Big.roundHalfUp).toNumber(),
          netProfitMin: globalAnalytics.netProfits.min?.round(2, Big.roundHalfUp).toNumber(),
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
          // Resulting balance considering profits, losses and movements (deposits and withdraws)
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
          sumCosts: globalAnalytics.costs.sum.round(2, Big.roundHalfUp).toNumber(),
          sumTaxes: globalAnalytics.taxes.sum.round(2, Big.roundHalfUp).toNumber(),
        },
        walletIds: wallets.map(wallet => wallet.id),
      },
    }
  }

  // TODO: use input.selectedCurrency to convert values to the selected currency
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

    const performanceSeriesMap = new Map<
      string,
      Omit<AnalyticSerie, 'dataPoints'> & { dataPoints: Map<string, AnalyticSerieDataPoint> }
    >([])

    for await (const walletInfo of walletsIterator.process()) {
      performanceSeriesMap.set(walletInfo.wallet.id, {
        dataPoints: new Map<string, AnalyticSerieDataPoint>(),
        walletId: walletInfo.wallet.id,
        walletName: walletInfo.wallet.name,
      })

      // Wallet movements
      for (const movement of walletInfo.wallet.movements) {
        const timelessDate = movement.dateUtc.toISODate()

        if (!performanceSeriesMap.has(walletInfo.wallet.id) || timelessDate === null) {
          continue
        }

        const dpKey = `movement-${timelessDate}`

        if (!performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.has(dpKey)) {
          performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.set(dpKey, {
            costsAndTaxes: 0,
            dateUtc: DateTime.fromISO(timelessDate, { zone: 'utc' }).toMillis(),
            daysRunning: 0,
            grossAmount: 0,
            inputAmount: movement.resultAmount.round(2, Big.roundHalfUp).toNumber(),
            netAmount: 0,
            type: 'movement',
          })
        } else {
          const existingDataPoint = performanceSeriesMap
            .get(walletInfo.wallet.id)!
            .dataPoints.get(dpKey)!
          existingDataPoint.inputAmount = movement.resultAmount
            .add(existingDataPoint.inputAmount)
            .round(2, Big.roundHalfUp)
            .toNumber()
          performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.set(dpKey, existingDataPoint)
        }
      }

      // Private bonds
      for (const bond of walletInfo.brlPrivateBonds) {
        const timelessDate = bond.latestDateUtc?.toISODate() ?? null

        if (
          !performanceSeriesMap.has(walletInfo.wallet.id) ||
          timelessDate === null ||
          !bond.isDone
        ) {
          continue
        }

        const dpKey = `brl_private_bond-${timelessDate}`

        if (!performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.has(dpKey)) {
          performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.set(dpKey, {
            costsAndTaxes: bond.costs.add(bond.taxes).round(2, Big.roundHalfUp).toNumber(),
            dateUtc: DateTime.fromISO(timelessDate, { zone: 'utc' }).toMillis(),
            daysRunning: bond.daysRunning,
            grossAmount: bond.grossAmount.round(2, Big.roundHalfUp).toNumber(),
            inputAmount: 0,
            netAmount: bond.netAmount.round(2, Big.roundHalfUp).toNumber(),
            type: 'brl_private_bond',
          })
        } else {
          const existingDataPoint = performanceSeriesMap
            .get(walletInfo.wallet.id)!
            .dataPoints.get(dpKey)!
          existingDataPoint.costsAndTaxes = bond.costs
            .add(bond.taxes)
            .add(existingDataPoint.costsAndTaxes)
            .round(2, Big.roundHalfUp)
            .toNumber()
          existingDataPoint.grossAmount = bond.grossAmount
            .add(existingDataPoint.grossAmount)
            .round(2, Big.roundHalfUp)
            .toNumber()
          existingDataPoint.netAmount = bond.netAmount
            .add(existingDataPoint.netAmount)
            .round(2, Big.roundHalfUp)
            .toNumber()
          existingDataPoint.daysRunning += bond.daysRunning
          performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.set(dpKey, existingDataPoint)
        }
      }

      // Public bonds
      for (const bond of walletInfo.brlPublicBonds) {
        const timelessDate = bond.latestDateUtc?.toISODate() ?? null

        if (
          !performanceSeriesMap.has(walletInfo.wallet.id) ||
          timelessDate === null ||
          !bond.isDone
        ) {
          continue
        }

        const dpKey = `brl_public_bond-${timelessDate}`

        if (!performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.has(dpKey)) {
          performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.set(dpKey, {
            costsAndTaxes: bond.costs.add(bond.taxes).round(2, Big.roundHalfUp).toNumber(),
            dateUtc: DateTime.fromISO(timelessDate, { zone: 'utc' }).toMillis(),
            daysRunning: bond.daysRunning,
            grossAmount: bond.grossAmount.round(2, Big.roundHalfUp).toNumber(),
            inputAmount: 0,
            netAmount: bond.netAmount.round(2, Big.roundHalfUp).toNumber(),
            type: 'brl_public_bond',
          })
        } else {
          const existingDataPoint = performanceSeriesMap
            .get(walletInfo.wallet.id)!
            .dataPoints.get(dpKey)!
          existingDataPoint.costsAndTaxes = bond.costs
            .add(bond.taxes)
            .add(existingDataPoint.costsAndTaxes)
            .round(2, Big.roundHalfUp)
            .toNumber()
          existingDataPoint.grossAmount = bond.grossAmount
            .add(existingDataPoint.grossAmount)
            .round(2, Big.roundHalfUp)
            .toNumber()
          existingDataPoint.netAmount = bond.netAmount
            .add(existingDataPoint.netAmount)
            .round(2, Big.roundHalfUp)
            .toNumber()
          existingDataPoint.daysRunning += bond.daysRunning
          performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.set(dpKey, existingDataPoint)
        }
      }

      // SEFBFR assets
      for (const asset of walletInfo.sefbfrAssets) {
        const timelessDate = asset.latestDateUtc?.toISODate() ?? null

        if (
          !performanceSeriesMap.has(walletInfo.wallet.id) ||
          timelessDate === null ||
          !asset.isDone
        ) {
          continue
        }

        const dpKey = `sefbfr-${timelessDate}`

        if (!performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.has(dpKey)) {
          performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.set(dpKey, {
            costsAndTaxes: asset.costs.add(asset.taxes).round(2, Big.roundHalfUp).toNumber(),
            dateUtc: DateTime.fromISO(timelessDate, { zone: 'utc' }).toMillis(),
            daysRunning: asset.daysRunning,
            grossAmount: asset.grossAmount.round(2, Big.roundHalfUp).toNumber(),
            inputAmount: 0,
            netAmount: asset.netAmount.round(2, Big.roundHalfUp).toNumber(),
            type: 'sefbfr',
          })
        } else {
          const existingDataPoint = performanceSeriesMap
            .get(walletInfo.wallet.id)!
            .dataPoints.get(dpKey)!
          existingDataPoint.costsAndTaxes = asset.costs
            .add(asset.taxes)
            .add(existingDataPoint.costsAndTaxes)
            .round(2, Big.roundHalfUp)
            .toNumber()
          existingDataPoint.grossAmount = asset.grossAmount
            .add(existingDataPoint.grossAmount)
            .round(2, Big.roundHalfUp)
            .toNumber()
          existingDataPoint.netAmount = asset.netAmount
            .add(existingDataPoint.netAmount)
            .round(2, Big.roundHalfUp)
            .toNumber()
          existingDataPoint.daysRunning += asset.daysRunning
          performanceSeriesMap.get(walletInfo.wallet.id)!.dataPoints.set(dpKey, existingDataPoint)
        }
      }
    }

    const performanceSeries: AnalyticSerie[] = []

    // Convert data points map to array and sort by date
    for (const series of performanceSeriesMap.values()) {
      const sortedDataPoints = Array.from(series.dataPoints.values()).sort(
        (a, b) => a.dateUtc - b.dateUtc,
      )

      performanceSeries.push({
        dataPoints: sortedDataPoints,
        walletId: series.walletId,
        walletName: series.walletName,
      })
    }

    return {
      data: performanceSeries,
    }
  }

  /**
   * Calculate the performance analytics for a given asset type (like bonds or stocks) and update the given global analytics with the results.
   *
   * It calculates:
   *  - `dateStartUtcAsset` and `dateEndUtcAsset`: the first and last dates of the assets, used to calculate other analytics like average cost per day;
   *  - `numberOfAssets`;
   *  - `numberOfAssetsProfit` and `numberOfAssetsLoss`: how many assets had profit and loss, used to calculate the breakeven point;
   *  - `numberOfActiveAssets`;
   *  - `numberOfActiveAssetsProfit` and `numberOfActiveAssetsLoss`: how many active assets had profit and loss, used to calculate the breakeven point considering only active assets;
   *  - `grossProfits` and `grossLosses`: the `sum` and `max` gross profit and loss, not considering costs and taxes;
   *  - `netProfits` and `netLosses`: the `sum` and `max` net profit and loss, considering costs and taxes;
   *  - `costs`: the `sum` and `max` costs of the assets;
   *  - `taxes`: the `sum` and `max` taxes of the assets;
   *  - `historyHighestBalance` and `historyLowestBalance`: the highest and lowest resulting balance in the history of the wallets;
   *  - `historyHighestNet` and `historyLowestNet`: the highest and lowest resulting net profit in the history of the wallets;
   *
   * @param aData - The performance data for the given asset type
   * @param gA - The global analytics to be updated with the results
   */
  private calculateAssetTypePerformance(aData: BasePerformance[], gA: GlobalAnalytics): void {
    for (const bond of aData) {
      gA.dateStartUtcAsset = this.pickDate(gA.dateStartUtcAsset, bond.startDateUtc, 'earliest')
      gA.dateEndUtcAsset = this.pickDate(gA.dateEndUtcAsset, bond.latestDateUtc, 'latest')

      // Asset/Bond had profit
      if (bond.netAmount.gt(0)) {
        gA.numberOfAssetsProfit += 1
        if (!bond.isDone) {
          gA.numberOfActiveAssetsProfit += 1
        }
      } else if (bond.netAmount.lt(0)) {
        gA.numberOfAssetsLoss += 1
        if (!bond.isDone) {
          gA.numberOfActiveAssetsLoss += 1
        }
      }

      // Done asset/bond
      if (bond.isDone) {
        gA.sumDaysByAsset = gA.sumDaysByAsset.add(bond.daysRunning)
      } else {
        gA.numberOfActiveAssets += 1
      }

      gA.grossProfits.sum = gA.grossProfits.sum.add(bond.grossAmount.gt(0) ? bond.grossAmount : 0)
      gA.grossLosses.sum = gA.grossLosses.sum.add(bond.grossAmount.lt(0) ? bond.grossAmount : 0)
      gA.netProfits.sum = gA.netProfits.sum.add(bond.netAmount.gt(0) ? bond.netAmount : 0)
      gA.netLosses.sum = gA.netLosses.sum.add(bond.netAmount.lt(0) ? bond.netAmount : 0)
      gA.costs.sum = gA.costs.sum.add(bond.costs)
      gA.taxes.sum = gA.taxes.sum.add(bond.taxes)

      gA.grossProfits.max = this.pickBig(
        gA.grossProfits.max,
        bond.grossAmount.gt(0) ? bond.grossAmount : undefined,
        'greatest',
        false,
      )
      gA.grossProfits.min = this.pickBig(
        gA.grossProfits.min,
        bond.grossAmount.gt(0) ? bond.grossAmount : undefined,
        'lowest',
        false,
      )
      gA.grossLosses.max = this.pickBig(
        gA.grossLosses.max,
        bond.grossAmount.lt(0) ? bond.grossAmount : undefined,
        'lowest',
        false,
      )
      gA.grossLosses.min = this.pickBig(
        gA.grossLosses.min,
        bond.grossAmount.lt(0) ? bond.grossAmount : undefined,
        'greatest',
        false,
      )
      gA.netProfits.max = this.pickBig(
        gA.netProfits.max,
        bond.netAmount.gt(0) ? bond.netAmount : undefined,
        'greatest',
        false,
      )
      gA.netProfits.min = this.pickBig(
        gA.netProfits.min,
        bond.netAmount.gt(0) ? bond.netAmount : undefined,
        'lowest',
        false,
      )
      gA.netLosses.max = this.pickBig(
        gA.netLosses.max,
        bond.netAmount.lt(0) ? bond.netAmount : undefined,
        'lowest',
        false,
      )
      gA.netLosses.min = this.pickBig(
        gA.netLosses.min,
        bond.netAmount.lt(0) ? bond.netAmount : undefined,
        'greatest',
        false,
      )
      gA.costs.max = this.pickBig(gA.costs.max, bond.costs, 'lowest', false)
      gA.taxes.max = this.pickBig(gA.taxes.max, bond.taxes, 'lowest', false)

      const localResultingBalance = gA.movements.sum.add(gA.netProfits.sum).add(gA.netLosses.sum)
      const localResultingNet = gA.netProfits.sum.add(gA.netLosses.sum)

      gA.historyHighestBalance = this.pickBig(
        gA.historyHighestBalance,
        localResultingBalance,
        'greatest',
        false,
      )
      gA.historyLowestBalance = this.pickBig(
        gA.historyLowestBalance,
        localResultingBalance,
        'lowest',
        false,
      )
      gA.historyHighestNet = this.pickBig(
        gA.historyHighestNet,
        localResultingNet,
        'greatest',
        false,
      )
      gA.historyLowestNet = this.pickBig(gA.historyLowestNet, localResultingNet, 'lowest', false)

      gA.numberOfAssets += 1
    }
  }

  /**
   * Decide the currency to show in the performance analytics, based on the wallet currencies and the selected currency.
   *
   * If selected currency is not "Wallet", it returns the selected currency.
   *
   * If the selected currency is "Wallet":
   *  - It picks the most present currency in the wallets;
   *  - If there is a tie, it picks the first one;
   *  - If there are no wallets, it defaults to BRL.
   *
   * @param walletCurrencies - The list of wallet currencies
   * @param selectedCurrency - The selected currency, can be a specific currency or "Wallet"
   * @returns The decided currency to show in the performance analytics
   */
  private decideCurrencyToShow(walletCurrencies: string[], selectedCurrency: string): string {
    if (selectedCurrency === 'Wallet') {
      const currencyCount: Record<string, number> = {}
      for (const currency of walletCurrencies) {
        if (!currencyCount[currency]) {
          currencyCount[currency] = 0
        }
        currencyCount[currency] += 1
      }
      const mostPresentCurrency = Object.entries(currencyCount).reduce((prev, curr) =>
        curr[1] > prev[1] ? curr : prev,
      )[0]
      if (mostPresentCurrency) {
        return mostPresentCurrency
      }
      if (walletCurrencies.length > 0) {
        return walletCurrencies[0]
      }
      return 'BRL'
    }
    return selectedCurrency
  }

  /**
   * Pick the earliest or latest date between two dates, no matter the order they are passed in.
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
  ): DateTime | undefined {
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
   * Pick the lowest or greatest number between two numbers, no matter the order they are passed in.
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
