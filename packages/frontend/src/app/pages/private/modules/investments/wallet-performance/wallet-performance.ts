import { Component } from '@angular/core'
import { PerformanceIndicator } from './performance-indicator/performance-indicator'
import { PerformanceSeries } from './performance-series/performance-series'

@Component({
  selector: 'kdongs-wallet-performance',
  imports: [PerformanceIndicator, PerformanceSeries],
  template: `
    <section class="bg-background-0 flex flex-col gap-12 px-6 py-12">
      <kdongs-performance-indicator />
      <kdongs-performance-series />
    </section>
  `,
})
export class WalletPerformance {}
