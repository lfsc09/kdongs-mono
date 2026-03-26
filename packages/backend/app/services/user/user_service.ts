import type { LoginResponse } from '@kdongs-mono/domain/dto/user/user-dto'
import { userRoleAbilities } from '@kdongs-mono/domain/types/auth/abilities'
import User from '#models/user/user'
import { userTokenAbilities } from '#services/user/helpers/user'
import { loginValidator } from '#validators/user/user'

export default class UserService {
  async login(
    input: Awaited<ReturnType<typeof loginValidator.validate>>,
  ): Promise<LoginResponse & { token: string }> {
    const user = await User.verifyCredentials(input.email, input.password)

    if (!(user.role in userRoleAbilities)) {
      throw new Error('Failed to get user abilities')
    }

    const tokenAbilities = userTokenAbilities(user.role)
    const tokenSecret = await User.accessTokens.create(user, tokenAbilities)
    const tokenValue = tokenSecret.value?.release()

    if (!tokenValue || !tokenSecret.expiresAt) {
      throw new Error('Failed to create access token')
    }

    return {
      allowedIn: userRoleAbilities[user.role],
      token: tokenValue,
      tokenExp: tokenSecret.expiresAt.getTime(),
      userEmail: user.email,
      userName: user.name,
    }
  }
}
