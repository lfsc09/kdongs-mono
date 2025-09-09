import vine from '@vinejs/vine';
import { paginationSchema } from '#validators/shared/pagination';

export const indexWalletsValidator = vine.compile(
  vine.object({
    userId: vine.string().uuid(),
    ...paginationSchema.getProperties(),
    sortBy: vine
      .enum(['walletName', 'walletCurrencyCode', 'walletCreatedAt', 'walletUpdatedAt'])
      .optional(),
  }),
);
