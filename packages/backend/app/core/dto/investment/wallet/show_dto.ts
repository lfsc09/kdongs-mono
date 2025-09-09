import type { InferInput } from '@vinejs/vine/types';
import type { showWalletValidator } from '#validators/investment/wallet/show';

export type ShowWalletRequest = InferInput<typeof showWalletValidator>;

// TODO: Add wallet data
export type ShowWalletResponse = {
  data: {
    walletId: string;
  };
};
