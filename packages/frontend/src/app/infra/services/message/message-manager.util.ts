import { signal } from '@angular/core'
import { MessageDetail } from './message-manager.model'

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
