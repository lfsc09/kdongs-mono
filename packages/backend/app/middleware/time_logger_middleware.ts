import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import type { NextFn } from '@adonisjs/core/types/http'

export default class TimeLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // For high-precision (nanosecond resolution)
    const start = process.hrtime.bigint()

    await next()

    const end = process.hrtime.bigint()
    // Convert to milliseconds
    const durationInMs = Number(end - start) / 1e6

    logger.info(
      "[TimeLogger] -> Request to '%s %s' took %sms",
      ctx.request.method(),
      ctx.request.url(),
      durationInMs.toFixed(3),
    )
  }
}
