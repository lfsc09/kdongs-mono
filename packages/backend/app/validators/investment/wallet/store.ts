import vine from '@vinejs/vine';
import { acceptedCurrencyCodes } from '../../../core/types/investment/currencies.js';

export const storeWalletValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid(),
    name: vine.string().minLength(1).maxLength(254),
    currencyCode: vine.string().in(acceptedCurrencyCodes),
  }),
);
