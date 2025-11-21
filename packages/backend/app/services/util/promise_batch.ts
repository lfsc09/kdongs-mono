/**
 * Processes a list of promises in sliding window batches, yielding results as they complete, and not waiting for the entire batch to finish.
 *
 * This is useful for controlling concurrency when dealing with a large number of asynchronous operations.
 *
 * @template T The type of the resolved value of the promises.
 * @example
 * const promises = [promise1, promise2, promise3, ...];
 * const batchSize = 2;
 * const promiseBatch = new PromiseBatch(promises, batchSize);
 *
 * for await (const result of promiseBatch.process()) {
 *   console.log(result);
 * }
 */
export class PromiseBatch<T> {
  private activePromises = new Set<Promise<T>>()

  constructor(
    private readonly promises: Promise<T>[],
    private readonly batchSize: number,
  ) {}

  async *process() {
    for (const promise of this.promises) {
      if (this.activePromises.size >= this.batchSize) {
        yield await Promise.race(this.activePromises)
      }

      const p = promise.finally(() => {
        this.activePromises.delete(p)
      })

      this.activePromises.add(p)
    }

    while (this.activePromises.size > 0) {
      yield await Promise.race(this.activePromises)
    }
  }
}
