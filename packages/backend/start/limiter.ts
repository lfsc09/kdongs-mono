/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'
import { UserRoles } from '@kdongs-mono/domain/types/user/user-role'

export const throttle = limiter.define('api', ctx => {
  if (ctx.auth.user) {
    const requests =
      ctx.auth.user.role === UserRoles.admin ? 100 : ctx.auth.user.role === UserRoles.user ? 25 : 10

    return limiter
      .allowRequests(requests)
      .every('1 minute')
      .usingKey(`${ctx.auth.user.role}_${ctx.auth.user.id}`)
  }

  return limiter.allowRequests(10).every('1 minute').usingKey(`ip_${ctx.request.ip()}`)
})

export const loginThrottle = limiter.define('login', () => {
  return limiter.allowRequests(5).every('15 minute').blockFor('30 minute')
})
