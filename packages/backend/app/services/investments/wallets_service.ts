import Big from 'big.js'
import { DateTime } from 'luxon'
import Wallet from '#models/investment/wallet'
import { PromiseBatch } from '#services/util/promise_batch'
import type { CreateWalletResponse } from '../../core/dto/investment/wallet/create_dto.js'
import type { DeleteWalletRequest } from '../../core/dto/investment/wallet/delete_dto.js'
import type { EditWalletRequest } from '../../core/dto/investment/wallet/edit_dto.js'
import type {
  IndexWalletsRequest,
  IndexWalletsResponse,
} from '../../core/dto/investment/wallet/index_dto.js'
import type {
  ShowWalletRequest,
  ShowWalletResponse,
} from '../../core/dto/investment/wallet/show_dto.js'
import type { StoreWalletRequest } from '../../core/dto/investment/wallet/store_dto.js'
import {
  HandleSelectedWalletsPerformanceRequest,
  HandleSelectedWalletsPerformanceResponse,
} from '../../core/dto/investment/wallet_performance/handle_dto.js'
import { acceptedCurrencyCodes, type CurrencyCode } from '../../core/types/investment/currencies.js'
import AssetBrlPrivateBondUtils from './helpers/asset_brl_private_bond.js'
import AssetBrlPublicBondUtils from './helpers/asset_brl_public_bond.js'
import AssetSefbfrUtils from './helpers/asset_sefbfr.js'

export default class WalletsService {
  async walletsList(input: IndexWalletsRequest): Promise<IndexWalletsResponse> {
    const page = Number(input.page) ?? 1
    const limit = Number(input.limit) ?? 10
    const sortOrder = input.sortOrder ?? 'desc'
    let sortBy: string

    switch (input.sortBy) {
      case 'walletName':
        sortBy = 'name'
        break
      case 'walletCurrencyCode':
        sortBy = 'currencyCode'
        break
      case 'walletCreatedAt':
        sortBy = 'createdAt'
        break
      case 'walletUpdatedAt':
        sortBy = 'updatedAt'
        break
      default:
        sortBy = 'createdAt'
        break
    }

    const wallets = await Wallet.query()
      .where('userId', input.userId)
      .orderBy(sortBy, sortOrder)
      .preload('movements')
      .paginate(page, limit)

    return {
      data: {
        wallets: await Promise.all(
          wallets.all().map(async (wallet: Wallet) => {
            // Submission balance is the balance of the wallet considering only the movements (submissions)
            const submissionBalance = wallet.movements.reduce(
              (acc, movement) => acc.add(movement.resultAmount),
              new Big(0),
            )

            const [brlPrivateBonds, brlPublicBonds, sefbfrAssets] = await Promise.all([
              AssetBrlPrivateBondUtils.getBondsPerformance(wallet.id),
              AssetBrlPublicBondUtils.getBondsPerformance(wallet.id),
              AssetSefbfrUtils.getAssetsPerformance(wallet.id),
            ])

            const brlPrivateBondsProfit = Array.from(brlPrivateBonds.values()).reduce(
              (acc, bond) => acc.add(bond.doneProfit ?? 0),
              new Big(0),
            )
            const brlPublicBondsProfit = Array.from(brlPublicBonds.values()).reduce(
              (acc, bond) => acc.add(bond.doneProfit ?? 0),
              new Big(0),
            )
            const sefbfrAssetsProfit = Array.from(sefbfrAssets.values()).reduce(
              (acc, asset) => acc.add(asset.doneProfit ?? 0),
              new Big(0),
            )

            const profitInCurrency = brlPrivateBondsProfit
              .add(brlPublicBondsProfit)
              .add(sefbfrAssetsProfit)

            // Current balance is the balance of the wallet considering the submissions and the investments done in the wallet
            const currentBalance = submissionBalance.add(profitInCurrency)

            const profitInPerc = submissionBalance.eq(0)
              ? submissionBalance
              : currentBalance.div(submissionBalance).minus(1)

            return {
              createdAt: wallet.createdAt.toISO() ?? undefined,
              currencyCode: wallet.currencyCode,
              currentBalance: currentBalance.round(2, Big.roundHalfEven).toNumber(),
              id: wallet.id,
              initialBalance: submissionBalance.round(2, Big.roundHalfEven).toNumber(),
              name: wallet.name,
              profitInCurrency: profitInCurrency.round(2, Big.roundHalfEven).toNumber(),
              profitInPerc: profitInPerc.round(2, Big.roundHalfEven).toNumber(),
              // FIXME: fix trend calculation
              trend: 'up',
              updatedAt: wallet.updatedAt?.toISO() ?? undefined,
            }
          }),
        ),
      },
      metadata: {
        limit: wallets.perPage,
        nextPage: wallets.hasMorePages ? wallets.currentPage + 1 : undefined,
        page: wallets.currentPage,
        previousPage: wallets.currentPage > 1 ? wallets.currentPage - 1 : undefined,
        totalCount: wallets.total,
        totalPages: wallets.lastPage,
      },
    }
  }

  async walletsPerformance(
    input: HandleSelectedWalletsPerformanceRequest,
  ): Promise<HandleSelectedWalletsPerformanceResponse> {
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
          AssetBrlPrivateBondUtils.getBondsPerformance(wallet.id),
          AssetBrlPublicBondUtils.getBondsPerformance(wallet.id),
          AssetSefbfrUtils.getAssetsPerformance(wallet.id),
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
      // Avg amount of days an Asset is held (until done)
      avgDaysByAsset: 0,
      dateEndUtcAsset: undefined as DateTime | undefined,
      dateEndUtcMovement: undefined as DateTime | undefined,
      // First and last Asset/Movement dates
      dateStartUtcAsset: undefined as DateTime | undefined,
      dateStartUtcMovement: undefined as DateTime | undefined,
      numberOfActiveAssets: 0,
      numberOfActiveAssetsLoss: 0,
      numberOfActiveAssetsProfit: 0,

      // Asset counters
      numberOfAssets: 0,
      numberOfAssetsLoss: 0,
      numberOfAssetsProfit: 0,

      // Submissions + Assets profit/loss
      resultingBalanceInCurrency: new Big(0),

      // Only Assets profit/loss
      resultingProfitInCurrency: new Big(0),
      resultingProfitInPerc: new Big(0),
    }

    for await (const walletInfo of walletsIterator.process()) {
      // Submission balance is the balance of the wallet considering only the movements (submissions)
      const submissionBalance = walletInfo.wallet.movements.reduce(
        (acc, movement) => acc.add(movement.resultAmount),
        new Big(0),
      )

      if (
        !globalAnalytics.dateStartUtcMovement ||
        globalAnalytics.dateStartUtcMovement > walletInfo.wallet.movements[0]?.dateUtc
      ) {
        globalAnalytics.dateStartUtcMovement = walletInfo.wallet.movements[0]?.dateUtc
      }
      if (
        !globalAnalytics.dateEndUtcMovement ||
        globalAnalytics.dateEndUtcMovement <
          walletInfo.wallet.movements[walletInfo.wallet.movements.length - 1]?.dateUtc
      ) {
        globalAnalytics.dateEndUtcMovement =
          walletInfo.wallet.movements[walletInfo.wallet.movements.length - 1]?.dateUtc
      }

      // Private bonds
      for (const bond of walletInfo.brlPrivateBonds.values()) {
        // Done bond
        if (bond.doneAt) {
          if (
            globalAnalytics.dateStartUtcAsset === undefined ||
            globalAnalytics.dateStartUtcAsset > bond.doneAt
          ) {
            globalAnalytics.dateStartUtcAsset = bond.doneAt
          }
          if (
            globalAnalytics.dateEndUtcAsset === undefined ||
            globalAnalytics.dateEndUtcAsset < bond.doneAt
          ) {
            globalAnalytics.dateEndUtcAsset = bond.doneAt
          }

          // Bond had profit
          if (bond.doneProfit.gt(0)) {
            globalAnalytics.numberOfAssetsProfit += 1
          } else if (bond.doneProfit.lt(0)) {
            globalAnalytics.numberOfAssetsLoss += 1
          }
        } else {
          globalAnalytics.numberOfActiveAssets += 1
        }

        globalAnalytics.numberOfAssets += 1
        globalAnalytics.resultingProfitInCurrency = globalAnalytics.resultingProfitInCurrency.add(
          bond.doneProfit,
        )
      }
    }

    return {
      data: {
        currencyToShow: 'BRL',
        indicators: {
          avgCostByAsset: 0,
          avgCostByDay: 0,
          avgCostByMonth: 0,
          avgCostByQuarter: 0,
          avgCostByYear: 0,
          avgDaysByAsset: 0,
          avgTaxByAsset: 0,
          avgTaxByDay: 0,
          avgTaxByMonth: 0,
          avgTaxByQuarter: 0,
          avgTaxByYear: 0,
          breakeven: 0,
          dateEndUtc: '',
          dateStartUtc: '',
          edge: 0,
          expectancyByAsset: 0,
          expectancyByDay: 0,
          expectancyByMonth: 0,
          expectancyByQuarter: 0,
          expectancyByYear: 0,
          historyHigh: 0,
          historyLow: 0,
          lossAvg: 0,
          lossMax: 0,
          lossSum: 0,
          numberOfActiveAssets: 0,
          numberOfActiveAssetsLoss: 0,
          numberOfActiveAssetsProfit: 0,
          numberOfAssets: 0,
          numberOfAssetsLoss: 0,
          numberOfAssetsProfit: 0,
          profitAvg: 0,
          profitMax: 0,
          profitSum: 0,
          resultingBalanceInCurrency: 0,
          resultingProfitInCurrency: 0,
          resultingProfitInPerc: 0,
        },
        series: [],
        walletIds: wallets.map(wallet => wallet.id),
      },
    }
  }

  async walletCreate(): Promise<CreateWalletResponse> {
    return {
      data: {
        currencyCodes: acceptedCurrencyCodes as CurrencyCode[],
      },
    }
  }

  async walletStore(input: StoreWalletRequest): Promise<void> {
    await Wallet.create({
      currencyCode: input.currencyCode as CurrencyCode,
      name: input.name,
      userId: input.userId,
    })
  }

  async walletShow(input: ShowWalletRequest): Promise<ShowWalletResponse> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail()
    return {
      data: {
        walletId: wallet.id,
      },
    }
  }

  async walletEdit(input: EditWalletRequest): Promise<void> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail()
    if (input.name) {
      wallet.name = input.name
    }
    if (input.currencyCode) {
      wallet.currencyCode = input.currencyCode as CurrencyCode
    }
    await wallet.save()
  }

  async walletDelete(input: DeleteWalletRequest): Promise<void> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail()
    await wallet.softDelete()
  }
}
