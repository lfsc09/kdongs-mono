import type { InferInput } from '@vinejs/vine/types';
import type { handleSelectedWalletsPerformanceValidator } from '#validators/investment/wallet_performance/handle';

export type HandleSelectedWalletsPerformanceRequest = InferInput<
  typeof handleSelectedWalletsPerformanceValidator
>;

export type HandleSelectedWalletsPerformanceResponse = {
  data: {
    indicators: {
      resultingBalanceInCurncy: number;
      resultingProfitInCurncy: number;
      resultingProfitInPerc: number;
      dateStartUtc: string;
      dateEndUtc: string;
      avgDaysByAsset: number;
      numberOfAssets: number;
      numberOfAssetsProfit: number;
      numberOfAssetsLoss: number;
      numberOfActiveAssets: number;
      numberOfActiveAssetsProfit: number;
      numberOfActiveAssetsLoss: number;
      expectancyByAsset: number;
      expectancyByDay: number;
      expectancyByMonth: number;
      expectancyByQuarter: number;
      expectancyByYear: number;
      avgCostByAsset: number;
      avgCostByDay: number;
      avgCostByMonth: number;
      avgCostByQuarter: number;
      avgCostByYear: number;
      avgTaxByAsset: number;
      avgTaxByDay: number;
      avgTaxByMonth: number;
      avgTaxByQuarter: number;
      avgTaxByYear: number;
      breakeven: number;
      edge: number;
      profitSum: number;
      profitAvg: number;
      profitMax: number;
      lossSum: number;
      lossAvg: number;
      lossMax: number;
      historyHigh: number;
      historyLow: number;
    };
    wallets: {
      partialId: string;
      name: string;
      currencyCode: string;
    }[];
    series: {
      type: SerieType;
      partialWalletId: string;
      exitDateUtc: string;
      inputAmount: number;
      grossProfit: number;
      netProfit: number;
      costsAndTaxes: number;
      daysRunning: number;
    }[];
  };
};

export type SerieType = 'movement' | 'brl_private_bond' | 'brl_public_bond' | 'sefbfr';
