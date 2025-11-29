import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginGatewayService } from '../../../infra/gateways/login/login-gateway.service';
import { GatewayError } from '../../../infra/gateways/shared/default-gateway.model';
import { MessageManagerService } from '../../../infra/services/error/message-manager.service';
import { Message } from '../../components/message-manager/message/message';
import { LoadingSpinner } from '../../components/message-manager/loading-spinner/loading-spinner';
import {
  MessageDetail,
  MessageRegion,
  MessageSeverity,
} from '../../../infra/services/error/message-manager.model';

@Component({
  selector: 'kdongs-landing',
  imports: [ReactiveFormsModule, Message, LoadingSpinner],
  providers: [LoginGatewayService],
  templateUrl: './landing.html',
})
export class Landing {
  /**
   * SERVICES
   */
  protected readonly messageManagerService = inject(MessageManagerService);
  private readonly _routerService = inject(Router);
  private readonly _formBuilderService = inject(NonNullableFormBuilder);
  private readonly _loginService = inject(LoginGatewayService);

  /**
   * SIGNALS
   */
  protected loading = signal<boolean>(false);
  protected currentSliderContent = signal<number>(0);
  protected currentMessage = signal<MessageDetail | null>(null);

  /**
   * VARS
   */
  protected formGroup = this._formBuilderService.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  private readonly messageChannel = {
    id: crypto.randomUUID(),
    name: 'landing-chn',
    region: MessageRegion.LOCAL,
  };
  private _authenticationSubscription: Subscription | undefined;
  private _messageChannelSubscription: Subscription | undefined;
  private _messageTimeAliveInterval: ReturnType<typeof setInterval> | undefined;
  private _carouselInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this._messageChannelSubscription = this.messageManagerService
      .registerChannel(this.messageChannel.id, this.messageChannel.name, this.messageChannel.region)
      .subscribe((message: MessageDetail) => {
        this.currentMessage.set(message);
        // Schedule removal of message after its aliveUntil time
        if (message.aliveUntil) {
          const timeToLive = message.aliveUntil.getTime() - new Date().getTime();
          this._messageTimeAliveInterval = setTimeout(() => {
            this.currentMessage.set(null);
          }, timeToLive);
        }
      });
    this._startCarousel();
  }

  ngOnDestroy(): void {
    this._authenticationSubscription?.unsubscribe();
    this._messageChannelSubscription?.unsubscribe();
    this.messageManagerService.unregisterChannel(this.messageChannel.id);
    this._stopCarousel();
    if (this._messageTimeAliveInterval) {
      clearTimeout(this._messageTimeAliveInterval);
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
            message: `The text "${text}" has been copied to your clipboard.`,
            severity: MessageSeverity.SUCCESS,
          },
          this.messageChannel.id,
          this.messageChannel.region,
          { timeAlive: 3000, shouldDelete: true },
        );
      })
      .catch((err) => {
        this.messageManagerService.sendMessage(
          {
            title: 'Copy failed',
            message: `Failed to copy text to clipboard: ${err}`,
            severity: MessageSeverity.ERROR,
          },
          this.messageChannel.id,
          this.messageChannel.region,
          { timeAlive: 5000, shouldDelete: true },
        );
      });
  }

  protected handleFormSubmit(submittedForm: any): void {
    this.messageManagerService.sendMessage(
      {
        title: 'Come',
        message: 'Suck my dick!!',
        severity: MessageSeverity.SUCCESS,
      },
      this.messageChannel.id,
      this.messageChannel.region,
      { timeAlive: 7000, shouldDelete: false },
    );
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this._authenticationSubscription = this._loginService
      .authenticate({ email: this.formGroup.value.email, password: this.formGroup.value.password })
      .subscribe({
        next: (response: boolean) => {
          if (!response) {
            throw new Error("Something doesn't feel right");
          }
          this._routerService.navigate(['/r!/home'], { replaceUrl: true });
        },
        error: (error: Error | GatewayError) => {
          this.formGroup.reset();
          submittedForm.resetForm();
          if (error instanceof GatewayError) {
            console.error(`[Authentication](${error.status}): ${error.message}`, error.description);
            this.messageManagerService.sendMessage(
              {
                title: error.message,
                message: error.description,
                severity: MessageSeverity.ERROR,
              },
              this.messageChannel.id,
              this.messageChannel.region,
              { timeAlive: 7000, shouldDelete: true },
            );
          } else {
            console.error('[Authentication]:', error.message);
            // toast.error('Something went wrong!', {
            //   description: 'Please try again later.',
            //   position: 'bottom-center',
            // });
          }
          this.loading.set(false);
        },
      });
  }

  private _startCarousel(): void {
    this._carouselInterval = setInterval(() => {
      this.currentSliderContent.update((current) => (current + 1) % 2);
    }, 7500);
  }

  private _stopCarousel(): void {
    if (this._carouselInterval) {
      clearInterval(this._carouselInterval);
    }
  }
}
