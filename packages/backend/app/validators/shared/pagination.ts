import { acceptedSortOrders } from '@kdongs-mono/domain/types/shared/pagination'
import vine from '@vinejs/vine'

export const paginationValidator = vine.create({
  limit: vine.number().min(1).max(100),
  page: vine.number().min(1),
  sortBy: vine.string().optional(),
  sortOrder: vine.string().in(acceptedSortOrders).optional(),
})
