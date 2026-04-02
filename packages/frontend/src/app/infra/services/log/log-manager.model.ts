import { signal } from '@angular/core'
import { Subscription } from 'rxjs'
import { LogManagerService } from './log-manager.service'

export const LogChannels = {
  docker: 'docker',
  local: 'local',
} as const

export const LogSeverity = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  success: 'success',
} as const

export interface LogDetail {
  id: ReturnType<typeof crypto.randomUUID>
  severity: keyof typeof LogSeverity
  tags: string[]
  title: string
  message?: string
  icon?: string
  createdAt?: Date
  showTtl: number
}

/**
 * Components should implement this interface to be able to use the LogManagerService
 */
export interface Comms {
  /**
   * SERVICES
   */
  readonly logManagerService: LogManagerService

  /**
   * SIGNALS
   */
  log: ReturnType<typeof signal<LogDetail | null>>

  /**
   * VARS
   */
  logChannelSubscription?: Subscription | undefined
  logTtlInterval?: ReturnType<typeof setTimeout> | undefined
}
