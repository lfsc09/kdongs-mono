import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class TimeLoggerMiddleware {
  async handle({ request, response, logger }: HttpContext, next: NextFn) {
    // For high-precision (nanosecond resolution)
    const start = process.hrtime()

    await next()

    const end = process.hrtime(start)
    const responseStatus = response.getStatus()
    const uri = request.url()
    const method = request.method()

    logger.info(`${method} ${uri}: ${responseStatus} (${string.prettyHrTime(end)})`)
  }
}
