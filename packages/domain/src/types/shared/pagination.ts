export const SortOrders = {
  asc: 'asc',
  desc: 'desc',
} as const
export type SortOrder = keyof typeof SortOrders
export const acceptedSortOrders = Object.values(SortOrders)
