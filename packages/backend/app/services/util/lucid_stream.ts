import { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'

/**
 * Utility to stream large datasets from the database using pagination.
 * This helps to avoid loading all records into memory at once.
 *
 * @template T The type of the records being streamed.
 * @param query The Lucid query builder instance to stream data from.
 * @param chunkSize The number of records to fetch per chunk/page.
 * @returns An async generator yielding records of type T.
 *
 * @example
 * const query = db.from('users').select('*');
 * for await (const user of lucidStream(query, 100)) {
 *   console.log(user);
 * }
 */
export async function* lucidStream<T>(
  query: DatabaseQueryBuilderContract<T>,
  chunkSize: number,
): AsyncGenerator<T, void, unknown> {
  let offset = 0
  while (true) {
    const rows = await query.clone().offset(offset).limit(chunkSize)
    if (rows.length === 0) {
      break
    }
    for (const row of rows) {
      yield row
    }
    offset += chunkSize
  }
}
