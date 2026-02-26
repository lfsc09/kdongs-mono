import { Component, inject, OnDestroy, OnInit } from '@angular/core'
import { PerformanceFilter } from './performance-filter/performance-filter'
import { PerformanceIndicator } from './performance-indicator/performance-indicator'
import { PerformanceSeries } from './performance-series/performance-series'
import { PerformanceService } from './performance.service'

@Component({
  selector: 'kdongs-performance',
  imports: [PerformanceFilter, PerformanceIndicator, PerformanceSeries],
  template: `
    @if (!performanceService.filterSidebarCollapsed()) {
      <kdongs-performance-filter />
    }
    <section class="bg-background-0 flex flex-col gap-12 px-6 py-12">
      <kdongs-performance-indicator />
      <kdongs-performance-series />
    </section>
  `,
})
export class Performance implements OnInit, OnDestroy {
  /**
   * SERVICES
   */
  protected readonly performanceService = inject(PerformanceService)

  ngOnInit(): void {
    this.performanceService.handleFilterSidebarButtonEnabled(true)
    this.performanceService.readUserPreferences()
  }

  ngOnDestroy(): void {
    this.performanceService.handleFilterSidebarButtonEnabled(false)
  }
}
