import Big from 'big.js';
import Wallet from '#models/investment/wallet';
import type { CreateWalletResponse } from '../../core/dto/investment/wallet/create_dto.js';
import type { DeleteWalletRequest } from '../../core/dto/investment/wallet/delete_dto.js';
import type { EditWalletRequest } from '../../core/dto/investment/wallet/edit_dto.js';
import type {
  IndexWalletsRequest,
  IndexWalletsResponse,
} from '../../core/dto/investment/wallet/index_dto.js';
import type {
  ShowWalletRequest,
  ShowWalletResponse,
} from '../../core/dto/investment/wallet/show_dto.js';
import type { StoreWalletRequest } from '../../core/dto/investment/wallet/store_dto.js';
import {
  acceptedCurrencyCodes,
  type CurrencyCode,
} from '../../core/types/investment/currencies.js';

export class WalletsService {
  async index(input: IndexWalletsRequest): Promise<IndexWalletsResponse> {
    const page = Number(input.page) ?? 1;
    const limit = Number(input.limit) ?? 10;
    const sortOrder = input.sortOrder ?? 'desc';
    let sortBy: string;

    switch (input.sortBy) {
      case 'walletName':
        sortBy = 'name';
        break;
      case 'walletCurrencyCode':
        sortBy = 'currencyCode';
        break;
      case 'walletCreatedAt':
        sortBy = 'createdAt';
        break;
      case 'walletUpdatedAt':
        sortBy = 'updatedAt';
        break;
      default:
        sortBy = 'createdAt';
        break;
    }

    const wallets = await Wallet.query()
      .where('userId', input.userId)
      .orderBy(sortBy, sortOrder)
      .preload('movements')
      .preload('assetBrlPrivateBonds')
      .preload('assetBrlPublicBonds')
      .paginate(page, limit);

    return {
      data: {
        wallets: wallets.all().map((wallet: Wallet) => {
          // Submission balance is the balance of the wallet considering only the movements (submissions)
          const submissionBalance = wallet.movements.reduce(
            (acc, movement) => acc.add(movement.resultAmount),
            new Big(0),
          );
          const brl_private_bonds = wallet.assetBrlPrivateBonds.reduce(
            (acc, bond) => acc.add(bond.netAmount ?? 0),
            new Big(0),
          );
          const brl_public_bonds = wallet.assetBrlPublicBonds.reduce(async (acc, bond) => {
            const { doneProfit } = await bond.getPerformance();
            return acc.add(doneProfit);
          }, new Big(0));

          const profit_in_curncy = brl_private_bonds.add(brl_public_bonds);

          // Current balance is the balance of the wallet considering the submissions and the investments done in the wallet
          const currentBalance = submissionBalance.add(profit_in_curncy);

          const profit_in_perc = submissionBalance.eq(0)
            ? submissionBalance
            : currentBalance.div(submissionBalance).minus(1);

          return {
            id: wallet.id,
            name: wallet.name,
            currencyCode: wallet.currencyCode,
            trend: 'up',
            initial_balance: submissionBalance.round(2, Big.roundHalfEven).toNumber(),
            current_balance: currentBalance.round(2, Big.roundHalfEven).toNumber(),
            profit_in_curncy: profit_in_curncy.round(2, Big.roundHalfEven).toNumber(),
            profit_in_perc: profit_in_perc.round(2, Big.roundHalfEven).toNumber(),
            createdAt: wallet.createdAt.toISO() ?? undefined,
            updatedAt: wallet.updatedAt?.toISO() ?? undefined,
          };
        }),
      },
      metadata: {
        totalCount: wallets.total,
        page: wallets.currentPage,
        limit: wallets.perPage,
        nextPage: wallets.hasMorePages ? wallets.currentPage + 1 : undefined,
        previousPage: wallets.currentPage > 1 ? wallets.currentPage - 1 : undefined,
        totalPages: wallets.lastPage,
      },
    };
  }

  async create(): Promise<CreateWalletResponse> {
    return {
      data: {
        currencyCodes: acceptedCurrencyCodes as CurrencyCode[],
      },
    };
  }

  async store(input: StoreWalletRequest): Promise<void> {
    await Wallet.create({
      userId: input.userId,
      name: input.name,
      currencyCode: input.currencyCode as CurrencyCode,
    });
  }

  async show(input: ShowWalletRequest): Promise<ShowWalletResponse> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail();
    return {
      data: {
        walletId: wallet.id,
      },
    };
  }

  async edit(input: EditWalletRequest): Promise<void> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail();
    if (input.name) {
      wallet.name = input.name;
    }
    if (input.currencyCode) {
      wallet.currencyCode = input.currencyCode as CurrencyCode;
    }
    await wallet.save();
  }

  async delete(input: DeleteWalletRequest): Promise<void> {
    const wallet = await Wallet.query()
      .where('id', input.walletId)
      .where('userId', input.userId)
      .firstOrFail();
    await wallet.softDelete();
  }
}
