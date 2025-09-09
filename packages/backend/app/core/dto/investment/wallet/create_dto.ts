import type { CurrencyCode } from '../../../types/investment/currencies.js';

export type CreateWalletResponse = {
  data: {
    currencyCodes: CurrencyCode[];
  };
};
