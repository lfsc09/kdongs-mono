import { signal } from '@angular/core'

export abstract class Datatable {
  /**
   * SIGNALS
   */
  protected currPage = signal<number>(1)
  protected pageSize = signal<number>(0)
  protected totalItems = signal<number>(0)
  protected totalPages = signal<number>(0)
  protected pageControls = signal<{
    next: number | null
    previous: number | null
    first: number | null
    last: number | null
  }>({
    next: null,
    previous: null,
    first: null,
    last: null,
  })

  constructor(protected defaultPageSize: number) {
    this.pageSize.set(defaultPageSize)
  }

  /**
   * FUNCTIONS
   */
  protected nextPage(): void {
    const nextPage = this.pageControls().next
    if (nextPage) {
      this.currPage.set(nextPage)
    }
  }

  protected previousPage(): void {
    const previousPage = this.pageControls().previous
    if (previousPage) {
      this.currPage.set(previousPage)
    }
  }

  protected firstPage(): void {
    const firstPage = this.pageControls().first
    if (firstPage) {
      this.currPage.set(firstPage)
    }
  }

  protected lastPage(): void {
    const lastPage = this.pageControls().last
    if (lastPage) {
      this.currPage.set(lastPage)
    }
  }
}
