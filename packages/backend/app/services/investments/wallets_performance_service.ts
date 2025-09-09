import Wallet from '#models/investment/wallet';
import type {
  ShowSelectedWalletsPerformanceRequest,
  ShowSelectedWalletsPerformanceResponse,
} from '../../core/dto/investment/wallet_performance/show_dto.js';

export class WalletsPerformanceService {
  async show(
    input: ShowSelectedWalletsPerformanceRequest,
  ): Promise<ShowSelectedWalletsPerformanceResponse> {
    const wallets = await Wallet.query()
      .whereIn('id', input.walletIds)
      .where('userId', input.userId)
      .preload('movements')
      .preload('assetBrlPrivateBonds')
      .preload('assetBrlPublicBonds', (query) => {
        query.preload('assetBrlPublicBondSells');
      })
      .preload('assetSefbfrs', (query) => {
        query.preload('assetSefbfrSells');
        query.preload('assetSefbfrTransfers');
        query.preload('assetSefbfrBonusShares');
        query.preload('assetSefbfrSplits');
        query.preload('assetSefbfrInplits');
        query.preload('assetSefbfrDividends');
      });
    return {
      data: {
        walletId: wallet.id,
      },
    };
  }
}
