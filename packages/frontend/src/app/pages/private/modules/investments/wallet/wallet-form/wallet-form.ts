import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { form, FormField, FormRoot } from '@angular/forms/signals'
import { ActivatedRoute } from '@angular/router'
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
  LogChannels,
  LogDetail,
  LogSeverity,
} from '../../../../../../infra/services/log/log-manager.model'
import { LogManagerService } from '../../../../../../infra/services/log/log-manager.service'
import {
  handleBasicErrorLog,
  handleBasicLogSub,
} from '../../../../../../infra/services/log/log-manager.util'
import { LoadingSpinner } from '../../../../../components/loading-spinner/loading-spinner'
import { LogToast } from '../../../../../components/log-manager/log-toast/log-toast'
import { LoadingBar } from '../../../../components/loading-bar/loading-bar'
import { WalletFormData, walletFormSchema } from './wallet-form.model'

@Component({
  selector: 'kdongs-wallet-form',
  imports: [FormRoot, FormField, LogToast, LoadingBar, LoadingSpinner],
  templateUrl: './wallet-form.html',
})
export class WalletForm implements OnInit, OnDestroy, Comms {
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
  protected walletId = signal<string | undefined>(undefined)
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
  logChannelSubscription: Subscription | undefined
  logTtlInterval: ReturnType<typeof setTimeout> | undefined
  private _defaultCurrencyCodeBrlIndex: number | undefined = undefined
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    this.walletId.set(this._route.snapshot.paramMap.get('walletId') ?? undefined)
  }

  ngOnInit(): void {
    this.logChannelSubscription = this.logManagerService
      .channel(LogChannels.local)
      .subscribe((log: LogDetail) => {
        this.logTtlInterval = handleBasicLogSub(log, this.log)
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
          handleBasicErrorLog(
            this.logManagerService,
            error,
            LogChannels.local,
            ['CreateWallet'],
            '7s'
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
            handleBasicErrorLog(
              this.logManagerService,
              error,
              LogChannels.local,
              ['EditWallet'],
              '7s'
            )
          },
        })
    }
  }

  ngOnDestroy(): void {
    this._investmentsSubscription?.unsubscribe()
    this.logChannelSubscription?.unsubscribe()
    if (this.logTtlInterval) {
      clearTimeout(this.logTtlInterval)
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
          this.logManagerService.log(
            {
              title: 'Wallet created successfully',
              severity: LogSeverity.success,
              tags: ['StoreWallet'],
            },
            '7s',
            LogChannels.local
          )
          this._resetForm()
        },
        error: (error: Error | GatewayError) => {
          this.loading.set('not')
          handleBasicErrorLog(
            this.logManagerService,
            error,
            LogChannels.local,
            ['StoreWallet'],
            '7s'
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
          this.logManagerService.log(
            {
              title: 'Wallet updated successfully',
              severity: LogSeverity.success,
              tags: ['UpdateWallet'],
            },
            '7s',
            LogChannels.local
          )
          this._resetForm()
        },
        error: (error: Error | GatewayError) => {
          this.loading.set('not')
          handleBasicErrorLog(
            this.logManagerService,
            error,
            LogChannels.local,
            ['UpdateWallet'],
            '7s'
          )
        },
      })
  }
}
