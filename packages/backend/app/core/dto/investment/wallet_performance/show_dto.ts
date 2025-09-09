import type { InferInput } from '@vinejs/vine/types';
import type { showSelectedWalletsPerformanceValidator } from '#validators/investment/wallet_performance/show';

export type ShowSelectedWalletsPerformanceRequest = InferInput<
  typeof showSelectedWalletsPerformanceValidator
>;

export type ShowSelectedWalletsPerformanceResponse = {
  data: {
    indicators: {
      resulting_balance_in_curncy: number;
      resulting_profit_in_curncy: number;
      resulting_profit_in_perc: number;
      date_start_utc: string;
      date_end_utc: string;
      avg_days_by_asset: number;
      number_of_assets: number;
      number_of_assets_profit: number;
      number_of_assets_loss: number;
      number_of_active_assets: number;
      number_of_active_assets_profit: number;
      number_of_active_assets_loss: number;
      expectancy_by_asset: number;
      expectancy_by_day: number;
      expectancy_by_month: number;
      expectancy_by_quarter: number;
      expectancy_by_year: number;
      avg_cost_by_asset: number;
      avg_cost_by_day: number;
      avg_cost_by_month: number;
      avg_cost_by_quarter: number;
      avg_cost_by_year: number;
      avg_tax_by_asset: number;
      avg_tax_by_day: number;
      avg_tax_by_month: number;
      avg_tax_by_quarter: number;
      avg_tax_by_year: number;
      breakeven: number;
      edge: number;
      profit_sum: number;
      profit_avg: number;
      profit_max: number;
      loss_sum: number;
      loss_avg: number;
      loss_max: number;
      history_high: number;
      history_low: number;
    };
    wallets: {
      partial_id: string;
      name: string;
      currency_code: string;
    }[];
    series: {
      type: SerieType;
      partial_wallet_id: string;
      exit_date_utc: string;
      input_amount: number;
      gross_profit: number;
      net_profit: number;
      costs_and_taxes: number;
      days_running: number;
    }[];
  };
};

export type SerieType = 'movement' | 'brl_private_bond' | 'brl_public_bond' | 'sefbfr';
