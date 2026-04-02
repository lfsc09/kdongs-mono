import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { ShowWalletMovementResponse } from '@kdongs-mono/domain/dto/investment/wallet-movement/wallet-movement-dto'
import { Subscription } from 'rxjs'
import { InvestmentsGatewayService } from '../../../../../../infra/gateways/investments/investments-gateway.service'
import { GatewayError } from '../../../../../../infra/gateways/shared/default-gateway.model'
import {
  Comms,
  LogChannels,
  LogDetail,
} from '../../../../../../infra/services/log/log-manager.model'
import { LogManagerService } from '../../../../../../infra/services/log/log-manager.service'
import { handleBasicErrorLog } from '../../../../../../infra/services/log/log-manager.util'

@Component({
  selector: 'kdongs-wallet-movement-detail',
  imports: [RouterLink],
  templateUrl: './wallet-movement-detail.html',
})
export class WalletMovementDetail implements OnInit, OnDestroy, Comms {
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
  protected movementData = signal<ShowWalletMovementResponse | null>(null)

  /**
   * VARS
   */
  protected readonly walletId: string | undefined
  protected readonly movementId: string | undefined
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    this.walletId = this._route.snapshot.paramMap.get('walletId') ?? undefined
    this.movementId = this._route.snapshot.paramMap.get('movementId') ?? undefined
  }

  ngOnInit(): void {
    if (!this.walletId || !this.movementId) {
      return
    }

    this.loading.set(true)
    this._investmentsSubscription = this._investmentsGatewayService
      .showWalletMovement({
        walletId: this.walletId,
        movementId: this.movementId,
      })
      .subscribe({
        next: response => {
          this.loading.set(false)
          this.movementData.set(response.data)
        },
        error: (error: Error | GatewayError) => {
          this.loading.set(false)
          this.movementData.set(null)
          handleBasicErrorLog(
            this.logManagerService,
            error,
            LogChannels.docker,
            ['WalletMovementDetail'],
            '7s'
          )
        },
      })
  }

  ngOnDestroy(): void {
    this._investmentsSubscription?.unsubscribe()
  }

  /**
   * FUNCTIONS
   */
}
