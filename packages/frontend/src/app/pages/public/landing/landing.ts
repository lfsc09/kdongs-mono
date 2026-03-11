import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { form, FormField } from '@angular/forms/signals'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { LoginGatewayService } from '../../../infra/gateways/login/login-gateway.service'
import { GatewayError } from '../../../infra/gateways/shared/default-gateway.model'
import {
  Comms,
  MessageDetail,
  MessageRegion,
  MessageSeverity,
} from '../../../infra/services/message/message-manager.model'
import { MessageManagerService } from '../../../infra/services/message/message-manager.service'
import {
  basicMessageCallback,
  handleBasicErrorMessage,
} from '../../../infra/services/message/message-manager.util'
import { Message } from '../../components/message-manager/message/message'
import { LoadingBar } from '../../private/components/loading-bar/loading-bar'
import { LandingFormData, landingFormSchema } from './landing.model'

@Component({
  selector: 'kdongs-landing',
  imports: [FormField, Message, LoadingBar],
  providers: [LoginGatewayService],
  templateUrl: './landing.html',
})
export class Landing implements OnInit, OnDestroy, Comms {
  /**
   * SERVICES
   */
  readonly messageManagerService = inject(MessageManagerService)
  private readonly _routerService = inject(Router)
  private readonly _loginService = inject(LoginGatewayService)

  /**
   * SIGNALS
   */
  currentMessage = signal<MessageDetail | null>(null)
  protected loading = signal<boolean>(false)
  protected currentSliderContent = signal<number>(0)
  protected formModel = signal<LandingFormData>({
    email: '',
    password: '',
  })
  protected form = form(this.formModel, landingFormSchema)

  /**
   * VARS
   */
  messageChannelSubscription: Subscription | undefined
  messageTimeAliveInterval: ReturnType<typeof setTimeout> | undefined
  readonly messageChannel = {
    id: crypto.randomUUID(),
    name: 'landing-chn',
    region: MessageRegion.LOCAL,
  }
  private _authenticationSubscription: Subscription | undefined
  private _carouselInterval: ReturnType<typeof setInterval> | undefined

  ngOnInit(): void {
    this.messageChannelSubscription = this.messageManagerService
      .registerChannel(this.messageChannel.id, this.messageChannel.name, this.messageChannel.region)
      .subscribe((message: MessageDetail) => {
        this.messageTimeAliveInterval = basicMessageCallback(message, this.currentMessage)
      })
    this._startCarousel()
  }

  ngOnDestroy(): void {
    this._authenticationSubscription?.unsubscribe()
    this.messageChannelSubscription?.unsubscribe()
    this.messageManagerService.unregisterChannel(this.messageChannel.id)
    this._stopCarousel()
    if (this.messageTimeAliveInterval) {
      clearTimeout(this.messageTimeAliveInterval)
    }
  }

  /**
   * FUNCTIONS
   */
  protected copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.messageManagerService.sendMessage(
          {
            title: 'Copied to clipboard',
            severity: MessageSeverity.INFO,
            icon: 'fa-regular fa-copy',
          },
          undefined,
          undefined,
          undefined,
          { timeAlive: 3000, shouldDelete: true }
        )
      })
      .catch(_err => {
        this.messageManagerService.sendMessage(
          {
            title: 'Copy failed',
            message: '(╯°□°)╯︵ ┻━┻ Please try again later.',
            severity: MessageSeverity.ERROR,
          },
          undefined,
          undefined,
          undefined,
          { timeAlive: 3000, shouldDelete: true }
        )
      })
  }

  protected onSubmit(event: Event): void {
    event.preventDefault()

    if (!this.form().valid()) {
      return
    }
    this.loading.set(true)

    const formValues = this.formModel()
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
        handleBasicErrorMessage(
          this.messageManagerService,
          error,
          this.messageChannel,
          MessageSeverity.ERROR,
          { tag: 'Authentication' },
          { timeAlive: 7000, shouldDelete: true }
        )
      },
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
}
