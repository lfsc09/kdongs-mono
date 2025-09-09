import vine from '@vinejs/vine';

export const showSelectedWalletsPerformanceValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid(),
    walletIds: vine.array(vine.string().uuid()).minLength(1),
  }),
);
