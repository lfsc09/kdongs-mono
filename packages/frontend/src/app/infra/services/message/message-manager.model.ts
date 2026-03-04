import { signal } from '@angular/core'
import { Subscription } from 'rxjs'
import { MessageManagerService } from './message-manager.service'

export interface LogInfo {
  tag: string
  message?: string
  statusCode?: number
  description?: string
}

export interface MessageChannel {
  id: ReturnType<typeof crypto.randomUUID>
  name: string
  region: MessageRegion
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
  readonly messageChannel: MessageChannel
  messageChannelSubscription: Subscription | undefined
  messageTimeAliveInterval: ReturnType<typeof setTimeout> | undefined
}
