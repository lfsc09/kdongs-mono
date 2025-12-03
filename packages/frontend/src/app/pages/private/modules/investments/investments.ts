import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WalletService } from './wallet/wallet.service';
import { Wallet } from './wallet/wallet';
import { InvestmentsGatewayService } from '../../../../infra/gateways/investments/investments-gateway.service';

@Component({
  selector: 'kdongs-investments',
  imports: [RouterOutlet, Wallet],
  providers: [WalletService, InvestmentsGatewayService],
  templateUrl: './investments.html',
})
export class Investments {
  /**
   * SERVICES
   */
  protected readonly walletService = inject(WalletService);
}
