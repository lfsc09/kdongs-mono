import { signal } from '@angular/core'
import { GatewayError } from '../../gateways/shared/default-gateway.model'
import { LogInfo, MessageChannel, MessageDetail, MessageSeverity } from './message-manager.model'
import { MessageManagerService } from './message-manager.service'

export const basicMessageCallback = (
  message: MessageDetail,
  currentMessage: ReturnType<typeof signal<MessageDetail | null>>
): number | undefined => {
  let timeToLive: number | undefined = undefined

  currentMessage.set(message)
  // Schedule removal of message after its aliveUntil time
  if (message.aliveUntil) {
    timeToLive = message.aliveUntil.getTime() - new Date().getTime()
    setTimeout(() => {
      currentMessage.set(null)
    }, timeToLive)
  }

  return timeToLive
}

export const handleBasicErrorMessage = (
  service: MessageManagerService,
  error: Error | GatewayError,
  messageChannel: MessageChannel,
  severity: MessageSeverity = MessageSeverity.ERROR,
  log?: Pick<LogInfo, 'tag'>,
  afterAction?: {
    timeAlive: number
    shouldDelete?: boolean
  }
): void => {
  if (error instanceof GatewayError) {
    service.sendMessage(
      {
        title: error.message,
        message: error.description,
        severity: severity,
      },
      messageChannel.id,
      messageChannel.region,
      log ? { tag: log.tag, statusCode: error.status } : undefined,
      afterAction
        ? { timeAlive: afterAction.timeAlive, shouldDelete: afterAction.shouldDelete ?? true }
        : undefined
    )
  } else {
    service.sendMessage(
      {
        title: 'Something went wrong',
        message: '(╯°□°)╯︵ ┻━┻ Please try again later.',
        severity: severity,
      },
      messageChannel.id,
      messageChannel.region,
      log ? { tag: log.tag } : undefined,
      afterAction
        ? { timeAlive: afterAction.timeAlive, shouldDelete: afterAction.shouldDelete ?? true }
        : undefined
    )
  }
}
