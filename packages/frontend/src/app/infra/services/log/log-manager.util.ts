import { signal } from '@angular/core'
import { GatewayError } from '../../gateways/shared/default-gateway.model'
import { LogChannels, LogDetail, LogSeverity } from './log-manager.model'
import { LogManagerService } from './log-manager.service'

export const handleBasicLogSub = (
  log: LogDetail,
  currentMessage: ReturnType<typeof signal<LogDetail | null>>
): number | undefined => {
  currentMessage.set(log)
  // Show log to user until TTL is over, if it exists
  if (log.showTtl) {
    setTimeout(() => {
      currentMessage.set(null)
    }, log.showTtl)
  }
  return log.showTtl
}

export const handleBasicErrorLog = (
  service: LogManagerService,
  error: Error | GatewayError,
  channel: keyof typeof LogChannels,
  tags: string[],
  ttl?: string
): void => {
  if (error instanceof GatewayError) {
    service.log(
      {
        title: error.message,
        message: error.description,
        severity: LogSeverity.error,
        tags,
      },
      ttl ?? service.DEFAULT_TTL_STR,
      channel
    )
  } else {
    service.log(
      {
        title: 'Something went wrong',
        message: '(╯°□°)╯︵ ┻━┻ Please try again later.',
        severity: LogSeverity.error,
        tags,
      },
      ttl ?? service.DEFAULT_TTL_STR,
      channel
    )
  }
}
