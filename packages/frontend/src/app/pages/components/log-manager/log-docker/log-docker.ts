import { Component, inject, OnInit, signal } from '@angular/core'
import { Subscription } from 'rxjs'
import { LogDetail } from '../../../../infra/services/log/log-manager.model'
import { LogManagerService } from '../../../../infra/services/log/log-manager.service'
import { LogToast } from '../log-toast/log-toast'

@Component({
  selector: 'kdongs-cp-log-docker',
  imports: [LogToast],
  template: `
    @if (currentMessage()) {
      <kdongs-cp-log-toast
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
export class LogDocker implements OnInit {
  /**
   * SERVICES
   */
  private readonly _logManagerService = inject(LogManagerService)

  /**
   * SIGNALS
   */
  protected currentMessage = signal<LogDetail | null>(null)

  /**
   * VARS
   */
  private _messageChannelSubscription: Subscription | undefined
  private _messageTimeAliveInterval: ReturnType<typeof setTimeout> | undefined

  ngOnInit(): void {
    this._messageChannelSubscription = this._logManagerService
      .channel()
      .subscribe((log: LogDetail) => {
        this.currentMessage.set(log)
        // Show log to user until TTL is over, if it exists
        if (log.showTtl) {
          this._messageTimeAliveInterval = setTimeout(() => {
            this.currentMessage.set(null)
          }, log.showTtl)
        }
      })
  }

  ngOnDestroy(): void {
    this._messageChannelSubscription?.unsubscribe()
    if (this._messageTimeAliveInterval) {
      clearTimeout(this._messageTimeAliveInterval)
    }
  }
}
