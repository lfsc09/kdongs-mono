import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageManagerService } from '../../../../infra/services/error/message-manager.service';
import {
  GlobalChannel,
  MessageDetail,
  MessageRegion,
} from '../../../../infra/services/error/message-manager.model';
import { Subscription } from 'rxjs';
import { Message } from '../message/message';

@Component({
  selector: 'kdongs-cp-message-docker',
  imports: [Message],
  template: `
    @if (currentMessage()) {
      <kdongs-cp-message
        [title]="currentMessage()!.title"
        [message]="currentMessage()!.message"
        [icon]="currentMessage()!.icon"
        [severity]="currentMessage()!.severity"
      />
    }
  `,
  styles: `
    :host {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      z-index: 50;
      width: 20rem;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
})
export class MessageDocker implements OnInit {
  /**
   * SERVICES
   */
  private readonly _messageManagerService = inject(MessageManagerService);

  /**
   * SIGNALS
   */
  protected currentMessage = signal<MessageDetail | null>(null);

  /**
   * VARS
   */
  private _messageChannelSubscription: Subscription | undefined;
  private _messageTimeAliveInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this._messageChannelSubscription = this._messageManagerService
      .registerChannel(GlobalChannel.DEFAULT, 'Global Default Channel', MessageRegion.GLOBAL)
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
  }

  ngOnDestroy(): void {
    this._messageChannelSubscription?.unsubscribe();
    this._messageManagerService.unregisterChannel(GlobalChannel.DEFAULT);
    if (this._messageTimeAliveInterval) {
      clearInterval(this._messageTimeAliveInterval);
    }
  }
}
