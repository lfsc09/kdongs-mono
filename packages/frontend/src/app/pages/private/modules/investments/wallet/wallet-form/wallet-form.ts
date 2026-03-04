import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core'
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import {
  CreateWalletDTO,
  EditWalletDTO,
} from '../../../../../../infra/gateways/investments/investments-gateway.model'
import { InvestmentsGatewayService } from '../../../../../../infra/gateways/investments/investments-gateway.service'
import { GatewayError } from '../../../../../../infra/gateways/shared/default-gateway.model'
import {
  Comms,
  MessageDetail,
  MessageRegion,
  MessageSeverity,
} from '../../../../../../infra/services/message/message-manager.model'
import { MessageManagerService } from '../../../../../../infra/services/message/message-manager.service'
import {
  basicMessageCallback,
  handleBasicErrorMessage,
} from '../../../../../../infra/services/message/message-manager.util'
import { Message } from '../../../../../components/message-manager/message/message'
import { LoadingBar } from '../../../../components/loading-bar/loading-bar'

@Component({
  selector: 'kdongs-wallet-form',
  imports: [ReactiveFormsModule, Message, LoadingBar],
  templateUrl: './wallet-form.html',
})
export class WalletForm implements OnInit, OnDestroy, Comms {
  /**
   * SERVICES
   */
  readonly messageManagerService = inject(MessageManagerService)
  private readonly _formBuilderService = inject(NonNullableFormBuilder)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)

  /**
   * SIGNALS
   */
  walletId = input<string | undefined>(undefined)
  currentMessage = signal<MessageDetail | null>(null)
  protected formData = signal<CreateWalletDTO | EditWalletDTO | null>(null)
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
  protected formGroup = this._formBuilderService.group({
    name: ['', Validators.required],
    currencyCode: ['', Validators.required],
  })
  private _defaultCurrencyCodeBrlIndex: number | undefined = undefined
  private _investmentsSubscription: Subscription | undefined

  ngOnInit(): void {
    // Register message channel
    this.messageChannelSubscription = this.messageManagerService
      .registerChannel(this.messageChannel.id, this.messageChannel.name, this.messageChannel.region)
      .subscribe((message: MessageDetail) => {
        this.messageTimeAliveInterval = basicMessageCallback(message, this.currentMessage)
      })

    // Fetch wallet data based on walletId input
    this.loading.set(true)
    const walletId = this.walletId()
    if (!walletId) {
      this._investmentsSubscription = this._investmentsGatewayService.createWallet().subscribe({
        next: response => {
          this.loading.set(false)
          this.formData.set(response.data)

          const brlIndex = response.data.currencyCodes.findIndex(code => code === 'BRL')
          this._defaultCurrencyCodeBrlIndex = brlIndex !== -1 ? brlIndex : 0

          this.formGroup.patchValue({
            currencyCode: response.data.currencyCodes[this._defaultCurrencyCodeBrlIndex],
          })
        },
        error: (error: Error | GatewayError) => {
          this.loading.set(false)
          this.formData.set(null)
          handleBasicErrorMessage(
            this.messageManagerService,
            error,
            this.messageChannel,
            MessageSeverity.ERROR,
            { tag: 'CreateWallet' },
            { timeAlive: 7000, shouldDelete: true }
          )
        },
      })
    } else {
      this._investmentsSubscription = this._investmentsGatewayService
        .editWallet({ walletId })
        .subscribe({
          next: response => {
            this.loading.set(false)
            this.formData.set(response.data)

            const brlIndex = response.data.currencyCodes.findIndex(code => code === 'BRL')
            this._defaultCurrencyCodeBrlIndex = brlIndex !== -1 ? brlIndex : 0

            this.formGroup.patchValue({
              name: response.data.wallet.name,
              currencyCode: response.data.wallet.currencyCode,
            })
          },
          error: (error: Error | GatewayError) => {
            this.loading.set(false)
            this.formData.set(null)
            handleBasicErrorMessage(
              this.messageManagerService,
              error,
              this.messageChannel,
              MessageSeverity.ERROR,
              { tag: 'EditWallet' },
              { timeAlive: 7000, shouldDelete: true }
            )
          },
        })
    }
  }

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
  protected handleFormSubmit(submittedForm: any): void {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched()
      return
    }
    this.loading.set(true)

    const walletId = this.walletId()
    if (!walletId) {
      this._investmentsSubscription = this._investmentsGatewayService
        .storeWallet(this.formGroup.value)
        .subscribe({
          next: () => {
            this.loading.set(false)
            this.messageManagerService.sendMessage(
              {
                title: 'Wallet created successfully',
                severity: MessageSeverity.SUCCESS,
              },
              this.messageChannel.id,
              this.messageChannel.region
            )
            submittedForm.resetForm()
          },
          error: (error: Error | GatewayError) => {
            this.loading.set(false)
            handleBasicErrorMessage(
              this.messageManagerService,
              error,
              this.messageChannel,
              MessageSeverity.ERROR,
              { tag: 'CreateWallet' },
              { timeAlive: 7000, shouldDelete: true }
            )
          },
        })
    } else {
      this._investmentsSubscription = this._investmentsGatewayService
        .updateWallet({ walletId, ...this.formGroup.value })
        .subscribe({
          next: () => {
            this.loading.set(false)
            this.messageManagerService.sendMessage(
              {
                title: 'Wallet updated successfully',
                severity: MessageSeverity.SUCCESS,
              },
              this.messageChannel.id,
              this.messageChannel.region
            )
          },
          error: (error: Error | GatewayError) => {
            this.loading.set(false)
            handleBasicErrorMessage(
              this.messageManagerService,
              error,
              this.messageChannel,
              MessageSeverity.ERROR,
              { tag: 'UpdateWallet' },
              { timeAlive: 7000, shouldDelete: true }
            )
          },
        })
    }
  }

  protected handleClear(): void {
    const formData = this.formData()
    if (formData && 'wallet' in formData) {
      this.formGroup.reset({
        name: formData.wallet.name,
        currencyCode: formData.wallet.currencyCode,
      })
    } else {
      this.formGroup.reset({
        name: '',
        currencyCode:
          this._defaultCurrencyCodeBrlIndex !== undefined
            ? formData?.currencyCodes[this._defaultCurrencyCodeBrlIndex] || ''
            : '',
      })
    }
  }
}
