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
