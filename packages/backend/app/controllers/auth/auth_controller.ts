import { inject } from '@adonisjs/core/container';
import type { HttpContext } from '@adonisjs/core/http';
import app from '@adonisjs/core/services/app';
import type { AuthService } from '#services/auth/auth_service';
import { loginValidator } from '#validators/auth/login';

@inject()
export default class AuthController {
  constructor(private authService: AuthService) {}

  async login({ request, response }: HttpContext) {
    const input = await request.validateUsing(loginValidator);
    const output = await this.authService.login(input);
    return response
      .cookie('token', output.secureCookie.token, {
        httpOnly: true,
        secure: app.inProduction,
        sameSite: app.inProduction ? 'lax' : 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      .status(200)
      .json({ data: output.data });
  }

  async logout({ response, auth }: HttpContext) {
    await this.authService.logout({ user: auth.user });
    return response
      .cookie('token', '', {
        httpOnly: true,
        secure: app.inProduction,
        sameSite: app.inProduction ? 'lax' : 'lax',
        maxAge: -1,
        path: '/',
      })
      .status(204);
  }
}
