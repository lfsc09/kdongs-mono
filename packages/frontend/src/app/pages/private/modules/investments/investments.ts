import { Component, inject, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { InvestmentsGatewayService } from '../../../../infra/gateways/investments/investments-gateway.service'
import { InvestmentsService } from './investments.service'
import { Wallet } from './wallet/wallet'

@Component({
  selector: 'kdongs-investments',
  imports: [RouterOutlet, Wallet],
  providers: [InvestmentsService, InvestmentsGatewayService],
  templateUrl: './investments.html',
})
export class Investments implements OnInit {
  /**
   * SERVICES
   */
  protected readonly investmentsService = inject(InvestmentsService)

  ngOnInit(): void {
    this.investmentsService.readUserPreferences()
  }
}
