import type { AccessToken } from '@adonisjs/auth/access_tokens';
import type User from '#models/user/user';

export type LogoutRequest = {
  user:
    | (User & {
        currentAccessToken: AccessToken;
      })
    | undefined;
};
