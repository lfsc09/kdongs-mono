import { signal } from '@angular/core'
import { Subscription } from 'rxjs'
import { MessageManagerService } from './message-manager.service'

export interface MessageChannel {
  id: string
  name: string
}

export interface MessageDetail {
  id: string
  severity: MessageSeverity
  title: string
  message?: string
  icon?: string
  channelId: MessageChannel['id']
  createdAt?: Date
  aliveUntil?: Date
}

export enum MessageSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

export enum MessageRegion {
  LOCAL = 'local',
  GLOBAL = 'global',
}

export enum GlobalChannel {
  DEFAULT = 'global-default-channel',
}

export interface Comms {
  /**
   * SERVICES
   */
  readonly messageManagerService: MessageManagerService

  /**
   * SIGNALS
   */
  currentMessage: ReturnType<typeof signal<MessageDetail | null>>

  /**
   * VARS
   */
  readonly messageChannel: {
    id: ReturnType<typeof crypto.randomUUID>
    name: string
    region: MessageRegion
  }
  messageChannelSubscription: Subscription | undefined
  messageTimeAliveInterval: ReturnType<typeof setTimeout> | undefined
}
