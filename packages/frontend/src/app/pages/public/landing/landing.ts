import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
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
import { basicMessageCallback } from '../../../infra/services/message/message-manager.util'
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner'
import { Message } from '../../components/message-manager/message/message'

@Component({
  selector: 'kdongs-landing',
  imports: [ReactiveFormsModule, Message, LoadingSpinner],
  providers: [LoginGatewayService],
  templateUrl: './landing.html',
})
export class Landing implements OnInit, OnDestroy, Comms {
  /**
   * SERVICES
   */
  readonly messageManagerService = inject(MessageManagerService)
  private readonly _routerService = inject(Router)
  private readonly _formBuilderService = inject(NonNullableFormBuilder)
  private readonly _loginService = inject(LoginGatewayService)

  /**
   * SIGNALS
   */
  currentMessage = signal<MessageDetail | null>(null)
  protected loading = signal<boolean>(false)
  protected currentSliderContent = signal<number>(0)

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
  protected formGroup = this._formBuilderService.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })
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
          { timeAlive: 3000, shouldDelete: true }
        )
      })
  }

  protected handleFormSubmit(submittedForm: any): void {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched()
      return
    }
    this.loading.set(true)
    this._authenticationSubscription = this._loginService
      .authenticate({ email: this.formGroup.value.email, password: this.formGroup.value.password })
      .subscribe({
        next: (response: boolean) => {
          if (!response) {
            throw new Error("Something doesn't feel right")
          }
          this._routerService.navigate(['/r!/home'], { replaceUrl: true })
        },
        error: (error: Error | GatewayError) => {
          this.formGroup.reset()
          submittedForm.resetForm()
          if (error instanceof GatewayError) {
            console.error(`[Authentication](${error.status}): ${error.message}`, error.description)
            this.messageManagerService.sendMessage(
              {
                title: error.message,
                message: error.description,
                severity: MessageSeverity.ERROR,
              },
              this.messageChannel.id,
              this.messageChannel.region,
              { timeAlive: 7000, shouldDelete: true }
            )
          } else {
            console.error('[Authentication]:', error.message)
            this.messageManagerService.sendMessage(
              {
                title: 'Something went wrong',
                message: '(╯°□°)╯︵ ┻━┻ Please try again later.',
                severity: MessageSeverity.ERROR,
              },
              this.messageChannel.id,
              this.messageChannel.region,
              { timeAlive: 7000, shouldDelete: true }
            )
          }
          this.loading.set(false)
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
