import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { form, FormField, FormRoot } from '@angular/forms/signals'
import { ActivatedRoute } from '@angular/router'
import {
  CreateWalletMovementResponse,
  EditWalletMovementResponse,
  UpdateWalletMovementRequest,
} from '@kdongs-mono/domain/dto/investment/wallet-movement/wallet-movement-dto'
import Big from 'big.js'
import { Subscription } from 'rxjs'
import { InputDecimalDirective } from '../../../../../../infra/directives/input-decimal.directive'
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
import { WalletMovementFormData, walletMovementFormSchema } from './wallet-movement-form.model'

@Component({
  selector: 'kdongs-wallet-movement-form',
  imports: [FormRoot, FormField, LogToast, LoadingBar, LoadingSpinner, InputDecimalDirective],
  templateUrl: './wallet-movement-form.html',
})
export class WalletMovementForm implements OnInit, OnDestroy, Comms {
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
  protected movementId = signal<string | undefined>(undefined)
  protected loading = signal<'not' | 'loading' | 'sending'>('not')
  protected formData = signal<CreateWalletMovementResponse | EditWalletMovementResponse | null>(
    null
  )
  protected formModel = signal<WalletMovementFormData>({
    movementType: '',
    institution: '',
    dateUtc: null,
    details: '',
    originCurrencyCode: '',
    originAmount: '',
    originExchGrossRate: '',
    originExchOpFee: '',
    originExchOpFeePerc: '',
    resultCurrencyCode: '',
  })
  protected form = form(this.formModel, walletMovementFormSchema, {
    submission: {
      action: async () => (this.movementId() ? this._submitEdit() : this._submitCreate()),
    },
  })
  protected autoOriginExchVetRate = computed(() => {
    const originExchGrossRate = this.form.originExchGrossRate().value()
    const originExchOpFee = this.form.originExchOpFee().value()

    if (
      !originExchGrossRate ||
      !originExchOpFee ||
      isNaN(Number(originExchGrossRate)) ||
      isNaN(Number(originExchOpFee))
    ) {
      return ''
    }

    return originExchOpFee
      ? new Big(originExchGrossRate).plus(originExchOpFee).round(6, Big.roundHalfUp).toString()
      : new Big(originExchGrossRate).round(6, Big.roundHalfUp).toString()
  })
  protected autoResultAmount = computed(() => {
    const hasConversion =
      this.form.originCurrencyCode().value() !== this.form.resultCurrencyCode().value()
    const originAmount = this.form.originAmount().value()

    if (!originAmount || isNaN(Number(originAmount))) {
      return ''
    }

    if (hasConversion) {
      if (!this.autoOriginExchVetRate()) {
        return ''
      }

      return new Big(originAmount)
        .div(this.autoOriginExchVetRate())
        .round(2, Big.roundHalfUp)
        .toString()
    }

    return new Big(originAmount).round(2, Big.roundHalfUp).toString()
  })

  /**
   * VARS
   */
  logChannelSubscription: Subscription | undefined
  logTtlInterval: ReturnType<typeof setTimeout> | undefined
  protected readonly walletId: string | undefined
  private _defaultCurrencyCodeBrlIndex: number | undefined = undefined
  private _investmentsSubscription: Subscription | undefined

  constructor() {
    this.movementId.set(this._route.snapshot.paramMap.get('movementId') ?? undefined)
    this.walletId = this._route.snapshot.paramMap.get('walletId') ?? undefined
  }

  ngOnInit(): void {
    this.logChannelSubscription = this.logManagerService
      .channel(LogChannels.local)
      .subscribe((log: LogDetail) => {
        this.logTtlInterval = handleBasicLogSub(log, this.log)
      })

    // Fetch wallet data based on walletId input
    if (!this.walletId) {
      return
    }

    this.loading.set('loading')
    const movementId = this.movementId()
    if (!movementId) {
      this._investmentsSubscription = this._investmentsGatewayService
        .createWalletMovement({ walletId: this.walletId })
        .subscribe({
          next: response => {
            this.loading.set('not')
            this.formData.set(response.data)

            const brlIndex = response.data.currencyCodes.findIndex(code => code === 'BRL')
            this._defaultCurrencyCodeBrlIndex = brlIndex !== -1 ? brlIndex : 0

            this.form.movementType().value.set(response.data.movementTypes[0])
            this.form
              .originCurrencyCode()
              .value.set(response.data.currencyCodes[this._defaultCurrencyCodeBrlIndex])
            this.form
              .resultCurrencyCode()
              .value.set(response.data.currencyCodes[this._defaultCurrencyCodeBrlIndex])
          },
          error: (error: Error | GatewayError) => {
            this.loading.set('not')
            this.formData.set(null)
            handleBasicErrorLog(
              this.logManagerService,
              error,
              LogChannels.local,
              ['CreateWalletMovement'],
              '7s'
            )
          },
        })
    } else {
      this._investmentsSubscription = this._investmentsGatewayService
        .editWalletMovement({ walletId: this.walletId, movementId })
        .subscribe({
          next: response => {
            this.loading.set('not')
            this.formData.set(response.data)

            const brlIndex = response.data.currencyCodes.findIndex(code => code === 'BRL')
            this._defaultCurrencyCodeBrlIndex = brlIndex !== -1 ? brlIndex : 0

            this.formModel.set({
              movementType: response.data.movement.movementType,
              institution: response.data.movement.institution ?? '',
              dateUtc: response.data.movement.dateUtc
                ? new Date(response.data.movement.dateUtc)
                : null,
              details: response.data.movement.details ?? '',
              originCurrencyCode: response.data.movement.originCurrencyCode,
              originAmount: response.data.movement.originAmount.toString(),
              originExchGrossRate: response.data.movement.originExchGrossRate?.toString() ?? '',
              originExchOpFee: response.data.movement.originExchOpFee?.toString() ?? '',
              originExchOpFeePerc: this.estimateFeePercentage(
                response.data.movement.originExchGrossRate?.toString() ?? '',
                response.data.movement.originExchOpFee?.toString() ?? ''
              ) as string,
              resultCurrencyCode: response.data.movement.resultCurrencyCode,
            })
          },
          error: (error: Error | GatewayError) => {
            this.loading.set('not')
            this.formData.set(null)
            handleBasicErrorLog(
              this.logManagerService,
              error,
              LogChannels.local,
              ['EditWalletMovement'],
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
  protected estimateFeePercentage(gR?: string, fA?: string): string | void {
    const readFromForm = !gR && !fA
    try {
      const grossRate = new Big(gR ?? this.form.originExchGrossRate().value())
      const fee = new Big(fA ?? this.form.originExchOpFee().value())
      const feePerc = fee.div(grossRate).times(100).round(2, Big.roundHalfUp).toString()
      if (readFromForm) {
        this.form.originExchOpFeePerc().value.set(feePerc)
      } else {
        return feePerc
      }
    } catch (_error) {
      if (readFromForm) {
        this.form.originExchOpFeePerc().value.set('')
      } else {
        return ''
      }
    }
  }

  protected estimateFeeAmount(gR?: string, fP?: string): string | void {
    const readFromForm = !gR && !fP
    try {
      const grossRate = new Big(gR ?? this.form.originExchGrossRate().value())
      const feePerc = new Big(fP ?? this.form.originExchOpFeePerc().value())
      const fee = grossRate.times(feePerc).div(100).round(6, Big.roundHalfUp).toString()
      if (readFromForm) {
        this.form.originExchOpFee().value.set(fee)
      } else {
        return fee
      }
    } catch (_error) {
      if (readFromForm) {
        this.form.originExchOpFee().value.set('')
      } else {
        return ''
      }
    }
  }

  protected handleClear(): void {
    const formData = this.formData()
    if (formData && 'movement' in formData) {
      this.form().reset({
        movementType: formData.movement.movementType,
        institution: formData.movement.institution ?? '',
        dateUtc: formData.movement.dateUtc ? new Date(formData.movement.dateUtc) : null,
        details: formData.movement.details ?? '',
        originCurrencyCode: formData.movement.originCurrencyCode,
        originAmount: formData.movement.originAmount.toString(),
        originExchGrossRate: formData.movement.originExchGrossRate?.toString() ?? '',
        originExchOpFee: formData.movement.originExchOpFee?.toString() ?? '',
        originExchOpFeePerc: this.estimateFeePercentage(
          formData.movement.originExchGrossRate?.toString() ?? '',
          formData.movement.originExchOpFee?.toString() ?? ''
        ) as string,
        resultCurrencyCode: formData.movement.resultCurrencyCode,
      })
    } else {
      this.form().reset({
        movementType: formData?.movementTypes[0] ?? '',
        institution: '',
        dateUtc: null,
        details: '',
        originCurrencyCode: formData?.currencyCodes[this._defaultCurrencyCodeBrlIndex ?? 0] ?? '',
        originAmount: '',
        originExchGrossRate: '',
        originExchOpFee: '',
        originExchOpFeePerc: '',
        resultCurrencyCode: formData?.currencyCodes[this._defaultCurrencyCodeBrlIndex ?? 0] ?? '',
      })
    }
  }

  private _resetForm(): void {
    const movementId = this.movementId()
    if (!movementId) {
      this.form().reset({
        movementType: this.formData()?.movementTypes[0] ?? '',
        institution: '',
        dateUtc: null,
        details: '',
        originCurrencyCode:
          this.formData()?.currencyCodes[this._defaultCurrencyCodeBrlIndex ?? 0] ?? '',
        originAmount: '',
        originExchGrossRate: '',
        originExchOpFee: '',
        originExchOpFeePerc: '',
        resultCurrencyCode:
          this.formData()?.currencyCodes[this._defaultCurrencyCodeBrlIndex ?? 0] ?? '',
      })
    } else {
      this.form().reset()
    }
  }

  private _submitCreate(): void {
    const formValues = this.formModel()

    if (!this.walletId) {
      return
    }

    this.loading.set('sending')
    this._investmentsSubscription = this._investmentsGatewayService
      .storeWalletMovement({
        walletId: this.walletId,
        ...formValues,
        dateUtc: formValues.dateUtc?.toISOString() ?? '',
      })
      .subscribe({
        next: () => {
          this.loading.set('not')
          this.logManagerService.log(
            {
              title: 'Movement created successfully',
              severity: LogSeverity.success,
              tags: ['StoreWalletMovement'],
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
            ['StoreWalletMovement'],
            '7s'
          )
        },
      })
  }

  private _submitEdit(): void {
    const movementId = this.movementId()!
    const formValues = this.formModel()

    if (!this.walletId) {
      return
    }

    const payload: UpdateWalletMovementRequest = {
      movementId,
      walletId: this.walletId,
      ...(this.form.movementType().dirty() && { movementType: formValues.movementType }),
      ...(this.form.institution().dirty() && { institution: formValues.institution }),
      ...(this.form.dateUtc().dirty() && { dateUtc: formValues.dateUtc?.toISOString() ?? '' }),
      ...(this.form.details().dirty() && { details: formValues.details }),
      ...(this.form.originCurrencyCode().dirty() && {
        originCurrencyCode: formValues.originCurrencyCode,
      }),
      ...(this.form.originAmount().dirty() && { originAmount: formValues.originAmount }),
      ...(this.form.originExchGrossRate().dirty() && {
        originExchGrossRate: formValues.originExchGrossRate,
      }),
      ...(this.form.originExchOpFee().dirty() && { originExchOpFee: formValues.originExchOpFee }),
      ...(this.form.resultCurrencyCode().dirty() && {
        resultCurrencyCode: formValues.resultCurrencyCode,
      }),
    }

    this.loading.set('sending')
    this._investmentsSubscription = this._investmentsGatewayService
      .updateWalletMovement(payload)
      .subscribe({
        next: () => {
          this.loading.set('not')
          this.logManagerService.log(
            {
              title: 'Wallet movement updated successfully',
              severity: LogSeverity.success,
              tags: ['UpdateWalletMovement'],
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
            ['UpdateWalletMovement'],
            '7s'
          )
        },
      })
  }
}
