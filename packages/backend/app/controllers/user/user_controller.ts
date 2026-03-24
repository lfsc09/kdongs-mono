import { inject } from '@adonisjs/core/container'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import UserService from '#services/user/user_service'
import { loginValidator } from '#validators/user/user'

@inject()
export default class UserController {
  constructor(private userService: UserService) {}

  async login({ request, response }: HttpContext) {
    const input = await request.validateUsing(loginValidator)
    const output = await this.userService.login(input)
    return response
      .encryptedCookie('token', output.token, {
        httpOnly: true,
        maxAge: '24h',
        path: '/',
        sameSite: 'lax',
        secure: app.inProduction,
      })
      .status(200)
      .json({
        data: {
          allowedIn: output.allowedIn,
          tokenExp: output.tokenExp,
          userEmail: output.userEmail,
          userName: output.userName,
        },
      })
  }

  async logout({ auth, response }: HttpContext) {
    auth.use('api').invalidateToken()
    return response
      .encryptedCookie('token', '', {
        httpOnly: true,
        maxAge: -1,
        path: '/',
        sameSite: 'lax',
        secure: app.inProduction,
      })
      .status(204)
  }

  // async signup({ request, serialize }: HttpContext) {
  //   const { name, email, password } = await request.validateUsing(signupValidator)

  //   const user = await User.create({ name, email, password })
  //   const token = await User.accessTokens.create(user)

  //   return serialize({
  //     user: UserTransformer.transform(user),
  //     token: token.value!.release(),
  //   })
  // }
}
