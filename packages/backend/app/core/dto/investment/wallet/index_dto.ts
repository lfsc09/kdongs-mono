import type { InferInput } from '@vinejs/vine/types';
import type { indexWalletsValidator } from '#validators/investment/wallet/index';
import type { PaginationResponse } from '../../shared/pagination_dto.js';

export type IndexWalletsRequest = InferInput<typeof indexWalletsValidator>;

export type IndexWalletsResponse = {
  data: {
    wallets: {
      id: string;
      name: string;
      currencyCode: string;
      trend: 'up' | 'down' | 'stable';
      initial_balance: number;
      current_balance: number;
      profit_in_curncy: number;
      profit_in_perc: number;
      createdAt?: string;
      updatedAt?: string;
    }[];
  };
  metadata: PaginationResponse;
};
