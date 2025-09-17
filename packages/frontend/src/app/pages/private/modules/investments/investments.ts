import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { InvestmentsGatewayService } from '../../../infra/gateways/investments/investments-gateway.service';
// import { WalletsComponent } from './wallets/wallets.component';
// import { WalletsService } from './wallets/wallets.service';

@Component({
  selector: 'app-investments',
  template: ` <router-outlet /> `,
  imports: [RouterOutlet],
})
export class Investments implements OnInit {
  /**
   * SERVICES
   */
  // protected readonly walletsService = inject(WalletsService);

  /**
   * VARS
   */
  // protected items: MenuItem[] | undefined;

  ngOnInit(): void {
    // this.items = [
    //   {
    //     label: 'Wallets',
    //     icon: 'pi pi-wallet',
    //     // command: () => this.walletsService.handleOpen(),
    //   },
    //   {
    //     label: 'Performance',
    //     icon: 'pi pi-chart-line',
    //     routerLink: 'performance',
    //   },
    //   {
    //     label: 'Balance History',
    //     icon: 'pi pi-arrow-right-arrow-left',
    //     routerLink: 'balance-history',
    //   },
    //   {
    //     label: 'Assets',
    //     icon: 'pi pi-database',
    //     routerLink: 'assets',
    //   },
    // ];
  }
}
