import type { InferInput } from '@vinejs/vine/types'
import type { paginationSchema } from '#validators/shared/pagination'

export type PaginationRequest = InferInput<typeof paginationSchema>

export type PaginationResponse = {
  totalCount: number
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  nextPage?: number
  previousPage?: number
  totalPages: number
}
