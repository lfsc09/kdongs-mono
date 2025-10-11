import User from '#models/user/user';
import type { LoginRequest, LoginResponse } from '../../core/dto/auth/login_dto.js';
import type { LogoutRequest } from '../../core/dto/auth/logout_dto.js';
import { frontendPermissionsbyUserRole } from '../../core/types/user/user_roles.js';

export default class AuthService {
  async login(input: LoginRequest): Promise<LoginResponse> {
    const user = await User.verifyCredentials(input.email, input.password);
    const token = (await User.accessTokens.create(user, ['*'], { expiresIn: '1 day' })).toJSON();

    if (!token.token || !token.expiresAt) {
      throw new Error('Failed to create token');
    }
    if (frontendPermissionsbyUserRole?.[user.role] === undefined) {
      throw new Error('Failed to get frontend permissions');
    }

    return {
      data: {
        userName: user.name,
        userEmail: user.email,
        allowedIn: frontendPermissionsbyUserRole[user.role],
        tokenExp: token.expiresAt.getTime(),
      },
      secureCookie: {
        token: token.token,
      },
    };
  }

  async logout(input: LogoutRequest): Promise<void> {
    if (input.user?.currentAccessToken) {
      await User.accessTokens.delete(input.user, input.user.currentAccessToken.identifier);
    }
  }
}
