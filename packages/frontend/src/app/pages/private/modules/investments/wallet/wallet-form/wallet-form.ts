import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core'
import { form, FormField, FormRoot } from '@angular/forms/signals'
import {
  CreateWalletResponse,
  EditWalletResponse,
  UpdateWalletRequest,
} from '@kdongs/domain/dto/investment/wallet/wallet-dto'
import { Subscription } from 'rxjs'
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
import { LoadingSpinner } from '../../../../../components/loading-spinner/loading-spinner'
import { Message } from '../../../../../components/message-manager/message/message'
import { LoadingBar } from '../../../../components/loading-bar/loading-bar'
import { WalletFormData, walletFormSchema } from './wallet-form.model'

@Component({
  selector: 'kdongs-wallet-form',
  imports: [FormRoot, FormField, Message, LoadingBar, LoadingSpinner],
  templateUrl: './wallet-form.html',
})
export class WalletForm implements OnInit, OnDestroy, Comms {
  /**
   * SERVICES
   */
  readonly messageManagerService = inject(MessageManagerService)
  private readonly _investmentsGatewayService = inject(InvestmentsGatewayService)

  /**
   * SIGNALS
   */
  walletId = input<string | undefined>(undefined)
  currentMessage = signal<MessageDetail | null>(null)
  protected loading = signal<'not' | 'loading' | 'sending'>('not')
  protected formData = signal<CreateWalletResponse | EditWalletResponse | null>(null)
  protected formModel = signal<WalletFormData>({
    name: '',
    currencyCode: '',
  })
  protected form = form(this.formModel, walletFormSchema, {
    submission: {
      action: async () => (this.walletId() ? this._submitEdit() : this._submitCreate()),
    },
  })

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
    this.loading.set('loading')
    const walletId = this.walletId()
    if (!walletId) {
      this._investmentsSubscription = this._investmentsGatewayService.createWallet().subscribe({
        next: response => {
          this.loading.set('not')
          this.formData.set(response.data)

          const brlIndex = response.data.currencyCodes.findIndex(code => code === 'BRL')
          this._defaultCurrencyCodeBrlIndex = brlIndex !== -1 ? brlIndex : 0

          this.form
            .currencyCode()
            .value.set(response.data.currencyCodes[this._defaultCurrencyCodeBrlIndex])
        },
        error: (error: Error | GatewayError) => {
          this.loading.set('not')
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
            this.loading.set('not')
            this.formData.set(response.data)

            const brlIndex = response.data.currencyCodes.findIndex(code => code === 'BRL')
            this._defaultCurrencyCodeBrlIndex = brlIndex !== -1 ? brlIndex : 0

            this.formModel.set({
              name: response.data.wallet.name,
              currencyCode: response.data.wallet.currencyCode,
            })
          },
          error: (error: Error | GatewayError) => {
            this.loading.set('not')
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
  protected handleClear(): void {
    const formData = this.formData()
    if (formData && 'wallet' in formData) {
      this.form().reset({
        name: formData.wallet.name,
        currencyCode: formData.wallet.currencyCode,
      })
    } else {
      this.form().reset({
        name: '',
        currencyCode: formData?.currencyCodes[this._defaultCurrencyCodeBrlIndex ?? 0] ?? '',
      })
    }
  }

  private _resetForm(): void {
    const walletId = this.walletId()
    if (!walletId) {
      this.form().reset({
        name: '',
        currencyCode: this.formData()?.currencyCodes[this._defaultCurrencyCodeBrlIndex ?? 0] ?? '',
      })
    } else {
      this.form().reset()
    }
  }

  private _submitCreate(): void {
    const formValues = this.formModel()

    this.loading.set('sending')
    this._investmentsSubscription = this._investmentsGatewayService
      .storeWallet(formValues)
      .subscribe({
        next: () => {
          this.loading.set('not')
          this.messageManagerService.sendMessage(
            {
              title: 'Wallet created successfully',
              severity: MessageSeverity.SUCCESS,
            },
            this.messageChannel.id,
            this.messageChannel.region
          )
          this._resetForm()
        },
        error: (error: Error | GatewayError) => {
          this.loading.set('not')
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
  }

  private _submitEdit(): void {
    const walletId = this.walletId()!
    const formValues = this.formModel()

    const payload: UpdateWalletRequest = {
      walletId,
      ...(this.form.name().dirty() && { name: formValues.name }),
      ...(this.form.currencyCode().dirty() && { currencyCode: formValues.currencyCode }),
    }

    this.loading.set('sending')
    this._investmentsSubscription = this._investmentsGatewayService
      .updateWallet(payload)
      .subscribe({
        next: () => {
          this.loading.set('not')
          this.messageManagerService.sendMessage(
            {
              title: 'Wallet updated successfully',
              severity: MessageSeverity.SUCCESS,
            },
            this.messageChannel.id,
            this.messageChannel.region
          )
          this._resetForm()
        },
        error: (error: Error | GatewayError) => {
          this.loading.set('not')
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
