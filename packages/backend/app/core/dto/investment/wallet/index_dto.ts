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
      initialBalance: number;
      currentBalance: number;
      profitInCurncy: number;
      profitInPerc: number;
      createdAt?: string;
      updatedAt?: string;
    }[];
  };
  metadata: PaginationResponse;
};
