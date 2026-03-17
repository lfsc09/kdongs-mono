import { PaginationResponse } from './pagination-dto.js'

export type AdonisJSError = {
  message: string
}

export type AdonisJSResponse<T> = {
  errors?: AdonisJSError[]
  data: T
}

export type AdonisJSPaginationResponse<T> = {
  errors?: AdonisJSError[]
  data: T
  metadata: PaginationResponse
}
