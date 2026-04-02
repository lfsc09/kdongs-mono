import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { form, FormField, FormRoot } from '@angular/forms/signals'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { LoginGatewayService } from '../../../infra/gateways/login/login-gateway.service'
import { GatewayError } from '../../../infra/gateways/shared/default-gateway.model'
import {
  Comms,
  LogChannels,
  LogDetail,
  LogSeverity,
} from '../../../infra/services/log/log-manager.model'
import { LogManagerService } from '../../../infra/services/log/log-manager.service'
import {
  handleBasicErrorLog,
  handleBasicLogSub,
} from '../../../infra/services/log/log-manager.util'
import { LogToast } from '../../components/log-manager/log-toast/log-toast'
import { LoadingBar } from '../../private/components/loading-bar/loading-bar'
import { LandingFormData, landingFormSchema } from './landing.model'

@Component({
  selector: 'kdongs-landing',
  imports: [FormRoot, FormField, LogToast, LoadingBar],
  providers: [LoginGatewayService],
  templateUrl: './landing.html',
})
export class Landing implements OnInit, OnDestroy, Comms {
  /**
   * SERVICES
   */
  readonly logManagerService = inject(LogManagerService)
  private readonly _routerService = inject(Router)
  private readonly _loginService = inject(LoginGatewayService)

  /**
   * SIGNALS
   */
  log = signal<LogDetail | null>(null)
  protected loading = signal<boolean>(false)
  protected currentSliderContent = signal<number>(0)
  protected formModel = signal<LandingFormData>({
    email: '',
    password: '',
  })
  protected form = form(this.formModel, landingFormSchema, {
    submission: {
      action: async () => this._submitLogin(),
    },
  })

  /**
   * VARS
   */
  logChannelSubscription: Subscription | undefined
  logTtlInterval: ReturnType<typeof setTimeout> | undefined
  private _authenticationSubscription: Subscription | undefined
  private _carouselInterval: ReturnType<typeof setInterval> | undefined

  ngOnInit(): void {
    this.logChannelSubscription = this.logManagerService
      .channel(LogChannels.local)
      .subscribe((log: LogDetail) => {
        this.logTtlInterval = handleBasicLogSub(log, this.log)
      })
    this._startCarousel()
  }

  ngOnDestroy(): void {
    this._authenticationSubscription?.unsubscribe()
    this.logChannelSubscription?.unsubscribe()
    this._stopCarousel()
    if (this.logTtlInterval) {
      clearTimeout(this.logTtlInterval)
    }
  }

  /**
   * FUNCTIONS
   */
  protected copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.logManagerService.log(
          {
            title: 'Copied to clipboard',
            severity: LogSeverity.info,
            icon: 'fa-regular fa-copy',
            tags: ['Landing', 'clipboard'],
          },
          '3s'
        )
      })
      .catch(_err => {
        this.logManagerService.log(
          {
            title: 'Copy failed',
            message: '(╯°□°)╯︵ ┻━┻ Please try again later.',
            severity: LogSeverity.error,
            tags: ['Landing', 'clipboard'],
          },
          '3s'
        )
      })
  }

  private _startCarousel(): void {
    this._carouselInterval = setInterval(() => {
      this.currentSliderContent.update(current => (current + 1) % 2)
    }, 7500)
  }

  private _stopCarousel(): void {
    if (this._carouselInterval) {
      clearInterval(this._carouselInterval)
    }
  }

  private _submitLogin(): void {
    const formValues = this.formModel()
    this.loading.set(true)
    this._authenticationSubscription = this._loginService.authenticate(formValues).subscribe({
      next: (response: boolean) => {
        if (!response) {
          throw new Error("Something doesn't feel right")
        }
        this._routerService.navigate(['/r!/home'], { replaceUrl: true })
      },
      error: (error: Error | GatewayError) => {
        this.loading.set(false)
        this.form().reset()
        handleBasicErrorLog(
          this.logManagerService,
          error,
          LogChannels.local,
          ['Landing', 'authentication'],
          '7s'
        )
      },
    })
  }
}
