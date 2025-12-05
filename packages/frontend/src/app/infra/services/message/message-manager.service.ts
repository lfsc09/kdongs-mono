import { Injectable, signal } from '@angular/core'
import { Subject } from 'rxjs'
import {
  GlobalChannel,
  MessageChannel,
  MessageDetail,
  MessageRegion,
} from './message-manager.model'

@Injectable({
  providedIn: 'root',
})
export class MessageManagerService {
  /**
   * SIGNALS
   */
  // Messages shown inside components or specific places
  private _localMessages = signal<Map<MessageDetail['id'], MessageDetail>>(new Map())
  localMessages = this._localMessages.asReadonly()

  // Messages shown globally in the notification area
  private _globalMessages = signal<Map<MessageDetail['id'], MessageDetail>>(new Map())
  globalMessages = this._globalMessages.asReadonly()

  private _activeLocalChannelsInfo = signal<Map<string, MessageChannel>>(new Map())
  activeLocalChannelsInfo = this._activeLocalChannelsInfo.asReadonly()

  private _activeGlobalChannelsInfo = signal<Map<string, MessageChannel>>(new Map())
  activeGlobalChannelsInfo = this._activeGlobalChannelsInfo.asReadonly()
  /**
   * VARS
   */
  private _lastLocalMessage: Map<MessageDetail['channelId'], Subject<MessageDetail>> = new Map()
  private _lastGlobalMessage: Map<MessageDetail['channelId'], Subject<MessageDetail>> = new Map()

  /**
   * FUNCTIONS
   */
  /**
   * Sends a new message to a channel in the specified region. If no channelId is provided, the message is sent to the default global channel.
   * @param message The message detail to register.
   * @param channelId The channelId to which the message belongs.
   * @param region The region where to register the message ({@link MessageRegion}).
   * @param afterAction Optional action to perform after a certain time (archive or delete).
   * @param afterAction.timeAlive Time in milliseconds after which to perform the action.
   * @param afterAction.shouldDelete Whether the message should be hard deleted after the timeAlive duration.
   *
   * @example
   * // Register a global message that is deleted after 5 seconds
   * messageManagerService.register(
   *   {
   *     title: 'Info',
   *     message: 'This is a global info message.',
   *     severity: 'info',
   *   },
   *   '550e8400-e29b-41d4-a716-446655440000',
   *   MessageRegion.GLOBAL,
   *   { timeAlive: 5000, shouldDelete: true }
   * );
   */
  sendMessage(
    messageData: Pick<MessageDetail, 'title' | 'message' | 'icon' | 'severity'>,
    channelId?: NonNullable<MessageDetail['channelId']>,
    region?: MessageRegion,
    afterAction?: {
      timeAlive: number
      shouldDelete?: boolean
    }
  ): void {
    let message: MessageDetail = {
      id: crypto.randomUUID(),
      channelId: channelId ?? GlobalChannel.DEFAULT,
      createdAt: new Date(),
      ...messageData,
    }

    if (afterAction && afterAction.timeAlive > 0) {
      message.aliveUntil = new Date(Date.now() + afterAction.timeAlive)
      if (afterAction.shouldDelete) {
        setTimeout(() => {
          this.deleteMessage(message.id!, region ?? MessageRegion.GLOBAL)
        }, afterAction.timeAlive)
      }
    }

    if (!region || region === MessageRegion.GLOBAL) {
      this._globalMessages.update(messages => new Map(messages).set(message.id, message))
      this._lastGlobalMessage.get(message.channelId)?.next(message)
    } else if (region === MessageRegion.LOCAL) {
      this._localMessages.update(messages => new Map(messages).set(message.id, message))
      this._lastLocalMessage.get(message.channelId)?.next(message)
    }
  }

  /**
   * Hard delete a message from a channel in the specified region.
   * @param messageId The ID of the message to delete.
   * @param region The region from which to delete the message ({@link MessageRegion}).
   *
   * @example
   * // Delete a local message
   * messageManagerService.delete('message-id-123', MessageRegion.LOCAL);
   */
  deleteMessage(messageId: string, region: MessageRegion): void {
    if (region === MessageRegion.LOCAL) {
      if (!this._localMessages().has(messageId)) {
        return
      }

      // Remove the message from local messages
      this._localMessages.update(messages => {
        const updatedMessages = new Map(messages)
        updatedMessages.delete(messageId)
        return updatedMessages
      })
    } else if (region === MessageRegion.GLOBAL) {
      if (!this._globalMessages().has(messageId)) {
        return
      }

      // Remove the message from global messages
      this._globalMessages.update(messages => {
        const updatedMessages = new Map(messages)
        updatedMessages.delete(messageId)
        return updatedMessages
      })
    }
  }

  /**
   * Get all messages from the specified region, filtered and sorted by the specified criterias.
   * @param region The region from which to get messages ({@link MessageRegion}, or 'all').
   * @param filter The criteria to filter messages by (channel, createdAt range, severity).
   * @param sort The criteria to sort messages by ('date' or 'severity') and the direction ('asc' or 'desc').
   * @returns An array of MessageDetail objects filtered and sorted by the specified criteria.
   *
   * @example
   * // Get all local messages sorted by date
   * const localMessagesByDate = messageManagerService.getMessagesSortedBy('local', undefined, { by: 'date', direction: 'asc' });
   *
   * // Get all global error messages from a specific channel, sorted by severity
   * const globalErrorMessages = messageManagerService.getMessagesSortedBy(
   *   'global',
   *   { channel: 'channel-1', severity: 'error' },
   *   { by: 'severity', direction: 'desc' }
   * );
   */
  getMessagesSortedBy(
    region: MessageRegion | 'all',
    filter?: {
      channelId?: MessageDetail['channelId']
      createdAt?: {
        from?: MessageDetail['createdAt']
        to?: MessageDetail['createdAt']
      }
      severity?: MessageDetail['severity']
    },
    sort?: {
      by: 'date' | 'severity'
      direction: 'asc' | 'desc'
    }
  ): MessageDetail[] {
    let messages: MessageDetail[] = []

    // Add local messages to results
    if (region === MessageRegion.LOCAL || region === 'all') {
      messages = messages.concat(
        Array.from(this._localMessages().values()).filter(message => {
          if (filter?.channelId && message.channelId !== filter.channelId) {
            return false
          }
          if (filter?.createdAt) {
            if (filter.createdAt.from && message.createdAt! < filter.createdAt.from) {
              return false
            }
            if (filter.createdAt.to && message.createdAt! > filter.createdAt.to) {
              return false
            }
          }
          if (filter?.severity && message.severity !== filter.severity) {
            return false
          }
          return true
        })
      )
    }

    // Add global messages to results
    if (region === MessageRegion.GLOBAL || region === 'all') {
      messages = messages.concat(
        Array.from(this._globalMessages().values()).filter(message => {
          if (filter?.channelId && message.channelId !== filter.channelId) {
            return false
          }
          if (filter?.createdAt) {
            if (filter.createdAt.from && message.createdAt! < filter.createdAt.from) {
              return false
            }
            if (filter.createdAt.to && message.createdAt! > filter.createdAt.to) {
              return false
            }
          }
          if (filter?.severity && message.severity !== filter.severity) {
            return false
          }
          return true
        })
      )
    }

    // Sort messages
    const sortBy = sort?.by || 'date'
    const sortDirection = sort?.direction || 'desc'
    if (sortBy === 'date') {
      return messages.sort((a, b) => {
        const comparison = b.createdAt!.getTime() - a.createdAt!.getTime()
        return sortDirection === 'asc' ? -comparison : comparison
      })
    } else if (sortBy === 'severity') {
      // Define severity levels
      const severityLevels: { [key: string]: number } = {
        error: 4,
        warning: 3,
        success: 2,
        info: 1,
      }
      return messages.sort((a, b) => {
        const comparison = severityLevels[b.severity] - severityLevels[a.severity]
        return sortDirection === 'asc' ? -comparison : comparison
      })
    }

    return messages
  }

  /**
   * Get the Subject Observable for a specific channel in the specified region.
   * @param channelId The ID of the channel.
   * @param region The region of the channel ({@link MessageRegion}).
   * @returns The Subject Observable for the specified channel, or undefined if the channel does not exist.
   *
   * @example
   * // Get the Subject for a global channel
   * const globalChannelSubject = messageManagerService.getChannel('channel-1', MessageRegion.GLOBAL);
   */
  getChannel(
    channelId: MessageChannel['id'],
    region: MessageRegion
  ): Subject<MessageDetail> | undefined {
    if (region === MessageRegion.LOCAL) {
      return this._lastLocalMessage.get(channelId)
    } else if (region === MessageRegion.GLOBAL) {
      return this._lastGlobalMessage.get(channelId)
    }
    return undefined
  }

  /**
   * Register a new channel in the specified region or return the existing one if it already exists.
   * @param channelId The ID of the channel.
   * @param channelName The name of the channel.
   * @param region The region where to register the channel ({@link MessageRegion}).
   * @returns The Subject Observable for the registered channel.
   *
   * @example
   * // Register a new local channel
   * const localChannelSubject = messageManagerService.registerChannel('local-chn', 'Local Channel', MessageRegion.LOCAL);
   */
  registerChannel(
    channelId: MessageChannel['id'],
    channelName: MessageChannel['name'],
    region: MessageRegion
  ): Subject<MessageDetail> {
    if (region === MessageRegion.LOCAL) {
      // Register the new channel info if it doesn't exist
      if (!this._activeLocalChannelsInfo().has(channelId)) {
        this._activeLocalChannelsInfo.update(channels =>
          new Map(channels).set(channelId, { id: channelId, name: channelName })
        )
      }

      // Create a new Subject Observable for the channel if it doesn't exist
      if (!this._lastLocalMessage.has(channelId)) {
        this._lastLocalMessage.set(channelId, new Subject<MessageDetail>())
      }

      return this._lastLocalMessage.get(channelId)!
    } else if (region === MessageRegion.GLOBAL) {
      // Register the new channel info if it doesn't exist
      if (!this._activeGlobalChannelsInfo().has(channelId)) {
        this._activeGlobalChannelsInfo.update(channels =>
          new Map(channels).set(channelId, { id: channelId, name: channelName })
        )
      }

      // Create a new Subject Observable for the channel if it doesn't exist
      if (!this._lastGlobalMessage.has(channelId)) {
        this._lastGlobalMessage.set(channelId, new Subject<MessageDetail>())
      }

      return this._lastGlobalMessage.get(channelId)!
    }
    throw new Error(`Invalid region: ${region}`)
  }

  /**
   * Unregister a channel from the specified region, cleaning up its messages and observables.
   * @param channelId The ID of the channel to unregister.
   *
   * @example
   * // Unregister a global channel
   * messageManagerService.unregisterChannel('global-chn');
   */
  unregisterChannel(channelId: MessageChannel['id']): void {
    // Cleanup local messages - find messages from the channel and delete them
    this._localMessages.update(messages => {
      const updatedMessages = new Map(messages)
      for (const [messageId, message] of updatedMessages.entries()) {
        if (message.channelId === channelId) {
          updatedMessages.delete(messageId)
        }
      }
      return updatedMessages
    })

    // Cleanup global messages - find messages from the channel and delete them
    this._globalMessages.update(messages => {
      const updatedMessages = new Map(messages)
      for (const [messageId, message] of updatedMessages.entries()) {
        if (message.channelId === channelId) {
          updatedMessages.delete(messageId)
        }
      }
      return updatedMessages
    })

    // Cleanup local channel subject observable
    if (this._lastLocalMessage.has(channelId)) {
      this._lastLocalMessage.get(channelId)!.complete()
      this._lastLocalMessage.delete(channelId)
    }

    // Cleanup global channel subject observable
    if (this._lastGlobalMessage.has(channelId)) {
      this._lastGlobalMessage.get(channelId)!.complete()
      this._lastGlobalMessage.delete(channelId)
    }

    // Delete info of local channel
    this._activeLocalChannelsInfo.update(channels => {
      const updatedChannels = new Map(channels)
      updatedChannels.delete(channelId)
      return updatedChannels
    })

    // Delete info of global channel
    this._activeGlobalChannelsInfo.update(channels => {
      const updatedChannels = new Map(channels)
      updatedChannels.delete(channelId)
      return updatedChannels
    })
  }
}
