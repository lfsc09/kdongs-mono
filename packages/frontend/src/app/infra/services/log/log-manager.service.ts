import { Injectable, isDevMode, signal } from '@angular/core'
import { Subject } from 'rxjs'
import { LogChannels, LogDetail, LogSeverity } from './log-manager.model'

@Injectable({
  providedIn: 'root',
})
export class LogManagerService {
  /**
   * CONSTS
   */
  readonly DEFAULT_TTL_STR = '5s'
  private readonly DEFAULT_TTL = 5000

  /**
   * SIGNALS
   */
  // History of all logs
  private _history = signal<Map<LogDetail['id'], LogDetail>>(new Map())
  history = this._history.asReadonly()

  // List of tags used in logs
  private _logTags = signal<Set<string>>(new Set())
  logTags = this._logTags.asReadonly()

  /**
   * VARS
   */
  private _channels: Map<keyof typeof LogChannels, Subject<LogDetail>> = new Map()

  /**
   * FUNCTIONS
   */
  /**
   * Logs a message with the specified details, registers it in the log history, and emits it to the specified channel if provided.
   *
   * @param logData The log information, including title, message, severity, tags, and optional icon.
   * @param ttl Time-to-live as a string (e.g., "5s", "2m", "1h") for the log.
   * @param channel The name of the channel to which the log belongs. If not provided, the log will not be emitted to any channel.
   */
  log(
    logData: Pick<LogDetail, 'title' | 'message' | 'icon' | 'severity' | 'tags'>,
    ttl: string,
    channel?: keyof typeof LogChannels
  ): void {
    // Register tags
    const existingTags = this._logTags()
    logData.tags.forEach(tag => {
      if (!existingTags.has(tag)) {
        existingTags.add(tag)
      }
    })
    this._logTags.set(existingTags)

    const log: LogDetail = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      showTtl: this._parseTtl(ttl) ?? this.DEFAULT_TTL,
      ...logData,
    }

    // Add log to history
    this._history.update(history => new Map(history).set(log.id, log))

    // Emit log to channel if specified
    this._pubChannel(log, channel)
  }

  /**
   * Logs a message to the console without registering it in the log history or emitting it to any channel.
   * Logs will be shown based on environment conditions (only in development by default) unless the `force` parameter is set to true.
   *
   * @param logData The log information, including title, message, severity, tags, and statusCode.
   * @param force If set to true, the log will be shown regardless of the environment.
   */
  silentLog(
    logData: Pick<LogDetail, 'title' | 'message' | 'severity' | 'tags'> & { statusCode?: number },
    force: boolean = false
  ): void {
    if (!force && !isDevMode()) {
      return
    }

    const tags = (logData.tags ?? []).map(tag => `[${tag}]`).join('')
    const logMessage = [
      `${tags}${logData.statusCode ? `(${logData.statusCode})` : ''}: ${logData.title ?? 'Unknown log message'}`,
      logData.message,
    ].filter(Boolean)

    switch (logData.severity) {
      case LogSeverity.info:
        console.log(...logMessage)
        break
      case LogSeverity.warning:
        console.warn(...logMessage)
        break
      case LogSeverity.error:
        console.error(...logMessage)
        break
    }
  }

  /**
   * Retrieves logs from the history based on optional filtering and sorting criteria.
   *
   * @param filter Optional filtering criteria, including creation date range and severity level.
   * @param sort Optional sorting criteria, including sorting field (date or severity) and direction (ascending or descending).
   * @returns An array of LogDetail objects that match the specified filtering and sorting criteria.
   *
   * @example
   * // Get all logs created in the last 3 hours, sorted by severity in descending order
   * const recentErrorLogs = logManagerService.getLogs(
   *   {
   *     createdAt: {
   *       from: new Date(Date.now() - 3 * 60 * 60 * 1000), // last 3 hours
   *     },
   *   },
   *   {
   *     by: 'severity',
   *     direction: 'desc',
   *   }
   * )
   *
   * // Get all logs with severity 'warning'
   * const warningLogs = logManagerService.getLogs(
   *   {
   *     severity: LogSeverity.warning,
   *   }
   * )
   */
  getLogs(
    filter?: {
      createdAt?: {
        from?: LogDetail['createdAt']
        to?: LogDetail['createdAt']
      }
      severity?: LogDetail['severity']
    },
    sort?: {
      by: 'date' | 'severity'
      direction: 'asc' | 'desc'
    }
  ): LogDetail[] {
    // Filter logs
    let logs = Array.from(this._history().values()).filter(message => {
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

    // Sort logs
    const sortBy = sort?.by || 'date'
    const sortDirection = sort?.direction || 'desc'
    if (sortBy === 'date') {
      return logs.sort((a, b) => {
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
      return logs.sort((a, b) => {
        const comparison = severityLevels[b.severity] - severityLevels[a.severity]
        return sortDirection === 'asc' ? -comparison : comparison
      })
    }

    return logs
  }

  /**
   * Delete a log from the history by its ID. This is a hard delete and the log will be removed from the history permanently.
   * @param logId The ID of the log to delete.
   *
   * @example
   * // Delete a log by its ID
   * logManagerService.deleteLog('log-id-123')
   */
  deleteLog(logId: LogDetail['id']): void {
    if (!this._history().has(logId)) {
      return
    }

    this._history.update(history => {
      const updatedHistory = new Map(history)
      updatedHistory.delete(logId)
      return updatedHistory
    })
  }

  /**
   * Get the Subject Observable for a specific channel. If the channel does not exist, it will be created.
   * @param channel The name of the channel to get.
   * @returns The Subject Observable for the specified channel.
   *
   * @example
   * // Sub to the docker channel to receive logs emitted to that channel
   * logManagerService
   *   .channel()
   *   .subscribe(log => {
   *     console.log(log)
   *   })
   *
   * // Sub to a local channel to receive logs emitted to that channel
   * logManagerService
   *   .channel(LogChannels.local)
   *   .subscribe(log => {
   *     console.log(log)
   *   })
   */
  channel(channel: keyof typeof LogChannels = LogChannels.docker): Subject<LogDetail> {
    if (!this._channels.has(channel)) {
      this._channels.set(channel, new Subject<LogDetail>())
    }
    return this._channels.get(channel)!
  }

  /**
   * Utility function to parse a TTL string (e.g., "5s", "2m", "1h") into milliseconds. Returns undefined for invalid formats.
   * @param ttl The TTL string to parse.
   * @returns The TTL in milliseconds, or undefined if the format is invalid.
   */
  private _parseTtl(ttl: string): number | undefined {
    const ttlPattern = /^(\d+)(ms|s|m|h)$/
    const match = ttl.match(ttlPattern)

    if (!match) {
      console.warn(
        `Invalid TTL format: ${ttl}. Expected format is a number followed by a unit (ms, s, m, h).`
      )
      return undefined
    }

    const value = parseInt(match[1], 10)
    const unit = match[2]

    switch (unit) {
      case 'ms':
        return value
      case 's':
        return value * 1000
      case 'm':
        return value * 60 * 1000
      case 'h':
        return value * 60 * 60 * 1000
      default:
        console.warn(`Unsupported TTL unit: ${unit}. Supported units are ms, s, m, h.`)
        return undefined
    }
  }

  /**
   * Publish a log to a specific channel. If the channel does not exist, it will be created.
   * @param log The log detail to publish.
   * @param channel The name of the channel to which the log belongs.
   */
  private _pubChannel(
    log: LogDetail,
    channel: keyof typeof LogChannels = LogChannels.docker
  ): void {
    if (!this._channels.has(channel)) {
      this._channels.set(channel, new Subject<LogDetail>())
    }
    this._channels.get(channel)?.next(log)
  }
}
