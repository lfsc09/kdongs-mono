import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import type { UserRole } from '@kdongs-mono/domain/types/user/user-role'
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  passwordColumnName: 'password',
  uids: ['email'],
})

export default class User extends compose(BaseModel, AuthFinder) {
  static table = 'users'
  static selfAssignPrimaryKey = true

  currentAccessToken?: AccessToken

  @beforeCreate()
  static assignData(user: User) {
    user.id = uuidv7()
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: UserRole

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '1 day',
    prefix: 'kds_',
  })
}
