import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { InvestmentsGatewayService } from '../../../../../../infra/gateways/investments/investments-gateway.service'
import {
  Comms,
  MessageDetail,
  MessageRegion,
} from '../../../../../../infra/services/message/message-manager.model'
import { MessageManagerService } from '../../../../../../infra/services/message/message-manager.service'
import { Message } from '../../../../../components/message-manager/message/message'
import { WalletMovement } from '../../wallet-movement/wallet-movement'

@Component({
  selector: 'kdongs-wallet-detail',
  imports: [Message, WalletMovement],
  templateUrl: './wallet-detail.html',
})
export class WalletDetail implements OnInit, OnDestroy, Comms {
  /**
   * SERVICES
   */
  readonly messageManagerService = inject(MessageManagerService)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)
  private readonly _route = inject(ActivatedRoute)

  /**
   * SIGNALS
   */
  currentMessage = signal<MessageDetail | null>(null)
  protected loading = signal<boolean>(false)

  /**
   * VARS
   */
  messageChannelSubscription: Subscription | undefined
  messageTimeAliveInterval: ReturnType<typeof setTimeout> | undefined
  readonly messageChannel = {
    id: crypto.randomUUID(),
    name: 'wallets-chn',
    region: MessageRegion.LOCAL,
  }
  protected readonly walletId: string | undefined
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    this.walletId = this._route.snapshot.paramMap.get('walletId') ?? undefined
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._investmentsSubscription?.unsubscribe()
    this.messageChannelSubscription?.unsubscribe()
    this.messageManagerService.unregisterChannel(this.messageChannel.id)
    if (this.messageTimeAliveInterval) {
      clearTimeout(this.messageTimeAliveInterval)
    }
  }

  /**
   * FUNCTIONS
   */
}
