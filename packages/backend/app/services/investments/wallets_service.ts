import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'
import Big from 'big.js'
import Wallet from '#models/investment/wallet'
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
import { acceptedCurrencyCodes, type CurrencyCode } from '../../core/types/investment/currency.js'
import { WalletMovementTypes } from '../../core/types/investment/wallet_movement.js'
import AssetBrlPrivateBondUtils from './helpers/asset_brl_private_bond.js'
import AssetBrlPublicBondUtils from './helpers/asset_brl_public_bond.js'
import AssetSefbfrUtils from './helpers/asset_sefbfr.js'

@inject()
export default class WalletsService {
  constructor(protected logger: Logger) {}

  async list(input: IndexWalletsRequest): Promise<IndexWalletsResponse> {
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
            // The wallet's balance considering only the movements
            const movementsBalance = wallet.movements.reduce((acc, movement) => {
              if (movement.movementType === WalletMovementTypes.deposit) {
                return acc.add(movement.resultAmount)
              } else {
                return acc.add(movement.resultAmount.abs().neg())
              }
            }, new Big(0))

            const [brlPrivateBonds, brlPublicBonds, sefbfrAssets] = await Promise.all([
              AssetBrlPrivateBondUtils.getAllBondsPerformance(wallet.id),
              AssetBrlPublicBondUtils.getAllBondsPerformance(
                wallet.id,
                undefined,
                false,
                this.logger,
              ),
              AssetSefbfrUtils.getAllAssetsPerformance(wallet.id, undefined, false, this.logger),
            ])

            const brlPrivateBondsProfit = brlPrivateBonds.reduce(
              (acc, bond) => acc.add(bond.netAmount ?? 0),
              new Big(0),
            )
            const brlPublicBondsProfit = brlPublicBonds.reduce(
              (acc, bond) => acc.add(bond.netAmount ?? 0),
              new Big(0),
            )
            const sefbfrAssetsProfit = sefbfrAssets.reduce(
              (acc, asset) => acc.add(asset.netAmount ?? 0),
              new Big(0),
            )

            const profitInCurrency = brlPrivateBondsProfit
              .add(brlPublicBondsProfit)
              .add(sefbfrAssetsProfit)

            // Current balance is the balance of the wallet considering the movements and the investments done in the wallet
            const currentBalance = movementsBalance.add(profitInCurrency)

            const profitInPerc = movementsBalance.eq(0)
              ? movementsBalance
              : currentBalance.div(movementsBalance).minus(1)

            return {
              createdAt: wallet.createdAt.toISO() ?? undefined,
              currencyCode: wallet.currencyCode,
              currentBalance: currentBalance.round(2, Big.roundHalfEven).toNumber(),
              id: wallet.id,
              initialBalance: movementsBalance.round(2, Big.roundHalfEven).toNumber(),
              name: wallet.name,
              profitInCurrency: profitInCurrency.round(2, Big.roundHalfEven).toNumber(),
              profitInPerc: profitInPerc.round(2, Big.roundHalfEven).toNumber(),
              // FIXME: implement trend calculation
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

  async create(): Promise<CreateWalletResponse> {
    return {
      data: {
        currencyCodes: acceptedCurrencyCodes as CurrencyCode[],
      },
    }
  }

  async store(input: StoreWalletRequest): Promise<void> {
    await Wallet.create({
      currencyCode: input.currencyCode as CurrencyCode,
      name: input.name,
      userId: input.userId,
    })
  }

  async show(input: ShowWalletRequest): Promise<ShowWalletResponse> {
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

  async edit(input: EditWalletRequest): Promise<void> {
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

  async softDelete(input: DeleteWalletRequest): Promise<void> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail()
    await wallet.softDelete()
  }
}
