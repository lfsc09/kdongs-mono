import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { Subscription } from 'rxjs'
import { InvestmentsGatewayService } from '../../../../../../infra/gateways/investments/investments-gateway.service'
import { Comms, LogDetail } from '../../../../../../infra/services/log/log-manager.model'
import { LogManagerService } from '../../../../../../infra/services/log/log-manager.service'
import { WalletMovement } from '../../wallet-movement/wallet-movement'

@Component({
  selector: 'kdongs-wallet-detail',
  imports: [RouterLink, WalletMovement],
  templateUrl: './wallet-detail.html',
})
export class WalletDetail implements OnInit, OnDestroy, Comms {
  /**
   * SERVICES
   */
  readonly logManagerService = inject(LogManagerService)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)
  private readonly _route = inject(ActivatedRoute)

  /**
   * SIGNALS
   */
  log = signal<LogDetail | null>(null)
  protected loading = signal<boolean>(false)

  /**
   * VARS
   */
  protected readonly walletId: string | undefined
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    this.walletId = this._route.snapshot.paramMap.get('walletId') ?? undefined
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._investmentsSubscription?.unsubscribe()
  }

  /**
   * FUNCTIONS
   */
}
