import type { LoginResponse } from '@kdongs-mono/domain/dto/user/user-dto'
import { UserAbility, userRoleAbilities } from '@kdongs-mono/domain/types/auth/abilities'
import { UserRole, UserRoles } from '@kdongs-mono/domain/types/user/user-role'
import User from '#models/user/user'
import { loginValidator } from '#validators/user/user'

export default class UserService {
  async login(
    input: Awaited<ReturnType<typeof loginValidator.validate>>,
  ): Promise<LoginResponse & { token: string }> {
    const user = await User.verifyCredentials(input.email, input.password)

    if (!(user.role in userRoleAbilities)) {
      throw new Error('Failed to get user abilities')
    }

    const tokenAbilities =
      user.role === UserRoles.admin ? ['*'] : userRoleAbilities[user.role as UserRole]
    const tokenSecret = await User.accessTokens.create(user, tokenAbilities)
    const tokenValue = tokenSecret.value?.release()

    if (!tokenValue || !tokenSecret.expiresAt) {
      throw new Error('Failed to create access token')
    }

    return {
      allowedIn: userRoleAbilities[user.role as UserRole] as UserAbility[],
      token: tokenValue,
      tokenExp: tokenSecret.expiresAt.getTime(),
      userEmail: user.email,
      userName: user.name,
    }
  }
}
