import vine from '@vinejs/vine';

export const paginationSchema = vine.object({
  page: vine.number().min(1),
  limit: vine.number().min(1).max(100),
  sortBy: vine.string().optional(),
  sortOrder: vine.enum(['asc', 'desc']).optional(),
});

export const paginationValidator = vine.compile(paginationSchema);
