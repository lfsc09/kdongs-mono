import vine from '@vinejs/vine';

export const handleSelectedWalletsPerformanceValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid(),
    walletIds: vine.array(vine.string().uuid()).minLength(1),
  }),
);
