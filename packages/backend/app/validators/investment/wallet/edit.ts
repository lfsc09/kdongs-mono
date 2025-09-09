import vine from '@vinejs/vine';
import { acceptedCurrencyCodes } from '../../../core/types/investment/currencies.js';

export const editWalletValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid(),
    walletId: vine.string().uuid(),
    name: vine.string().minLength(1).maxLength(254).optional(),
    currencyCode: vine.string().in(acceptedCurrencyCodes).optional(),
  }),
);
