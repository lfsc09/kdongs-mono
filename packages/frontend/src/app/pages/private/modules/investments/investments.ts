import { Component, inject } from '@angular/core'
import { RouterLink, RouterOutlet } from '@angular/router'
import { InvestmentsGatewayService } from '../../../../infra/gateways/investments/investments-gateway.service'
import { PerformanceService } from './performance/performance.service'

@Component({
  selector: 'kdongs-investments',
  imports: [RouterOutlet, RouterLink],
  providers: [PerformanceService, InvestmentsGatewayService],
  templateUrl: './investments.html',
})
export class Investments {
  /**
   * SERVICES
   */
  protected readonly performanceService = inject(PerformanceService)
}
