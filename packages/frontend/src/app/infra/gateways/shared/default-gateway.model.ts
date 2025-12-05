import { z } from 'zod'

export const AdonisJSErrorSchema = z.object({
  errors: z.array(z.object({ message: z.string() })),
})
export type AdonisJSError = z.infer<typeof AdonisJSErrorSchema>

export class GatewayError extends Error {
  constructor(
    readonly status: number | undefined,
    readonly description: string,
    message: string,
    options: { cause?: Error } = {}
  ) {
    super(message, options)
    this.name = 'GatewayError'
    this.cause = options.cause
  }
}

export const PaginationRequestSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
})
export const SortOrderSchema = z.enum(['asc', 'desc'])
export const PaginationResponseSchema = z.object({
  totalCount: z.number().min(0),
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  sortBy: z.optional(z.string()),
  sortOrder: z.optional(SortOrderSchema),
  nextPage: z.optional(z.number().min(1)),
  previousPOage: z.optional(z.number().min(1)),
  totalPages: z.number().min(0),
})

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>
export type SortOrder = z.infer<typeof SortOrderSchema>
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>
