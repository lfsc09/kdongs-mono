import { SortOrder } from '../../types/shared/pagination.js'

export type PaginationRequest = {
  limit: number
  page: number
  sortBy?: string
  sortOrder?: SortOrder
}

export type PaginationResponse = {
  totalCount: number
  page: number
  limit: number
  sortBy?: string
  sortOrder?: SortOrder
  nextPage?: number
  previousPage?: number
  totalPages: number
}
