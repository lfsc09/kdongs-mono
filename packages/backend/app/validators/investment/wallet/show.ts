import vine from '@vinejs/vine';

export const showWalletValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid(),
    walletId: vine.string().uuid(),
  }),
);
