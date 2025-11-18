import { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'

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
