import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware to convert cookie to Authorization header
 * This middleware checks for a 'token' cookie and sets it as an Authorization header if not already present.
 */
export default class CookieToAuthHeaderMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const token = ctx.request.cookie('token')
    if (token && !ctx.request.header('authorization')) {
      ctx.request.headers().authorization = `Bearer ${token}`
    }
    await next()
  }
}
