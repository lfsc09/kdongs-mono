import Wallet from '#models/investment/wallet';
import type {
  ShowSelectedWalletsPerformanceRequest,
  ShowSelectedWalletsPerformanceResponse,
} from '../../core/dto/investment/wallet_performance/show_dto.js';

export class WalletsPerformanceService {
  async show(
    input: ShowSelectedWalletsPerformanceRequest,
  ): Promise<ShowSelectedWalletsPerformanceResponse> {
    const _wallets = await Wallet.query()
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
        indicators: {
          resulting_balance_in_curncy: 0,
          resulting_profit_in_curncy: 0,
          resulting_profit_in_perc: 0,
          date_start_utc: '',
          date_end_utc: '',
          avg_days_by_asset: 0,
          number_of_assets: 0,
          number_of_assets_profit: 0,
          number_of_assets_loss: 0,
          number_of_active_assets: 0,
          number_of_active_assets_profit: 0,
          number_of_active_assets_loss: 0,
          expectancy_by_asset: 0,
          expectancy_by_day: 0,
          expectancy_by_month: 0,
          expectancy_by_quarter: 0,
          expectancy_by_year: 0,
          avg_cost_by_asset: 0,
          avg_cost_by_day: 0,
          avg_cost_by_month: 0,
          avg_cost_by_quarter: 0,
          avg_cost_by_year: 0,
          avg_tax_by_asset: 0,
          avg_tax_by_day: 0,
          avg_tax_by_month: 0,
          avg_tax_by_quarter: 0,
          avg_tax_by_year: 0,
          breakeven: 0,
          edge: 0,
          profit_sum: 0,
          profit_avg: 0,
          profit_max: 0,
          loss_sum: 0,
          loss_avg: 0,
          loss_max: 0,
          history_high: 0,
          history_low: 0,
        },
        wallets: [],
        series: [],
      },
    };
  }
}
